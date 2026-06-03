import "server-only";
import { getHubspotAccessToken } from "@/lib/integrations/hubspot";

export type HubspotQbrMetrics = {
  currency: string;
  /** Sum of open (not-closed) deal amounts, in major currency units. */
  openPipelineValue: number;
  /** Closed-won deal value with a close date in the trailing window. */
  closedWonValue: number;
  newDeals: number;
  /** won / (won + lost) over the window, 0..1, or null if no closed deals. */
  winRate: number | null;
  periodDays: number;
  topOpenDeals: { label: string; amount: number }[];
};

type TokenAccount = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};

const PERIOD_DAYS = 90;
const MAX_DEALS = 1000;
const DEAL_PROPERTIES = [
  "amount",
  "dealname",
  "closedate",
  "createdate",
  "hs_is_closed",
  "hs_is_closed_won",
  "deal_currency_code",
].join(",");

type Deal = { properties: Record<string, string | null> };

/**
 * Reads QBR-relevant pipeline metrics from a connected HubSpot account. Bounded
 * paging; the caller handles thrown errors with a graceful fallback.
 */
export async function getHubspotQbrMetrics(account: TokenAccount): Promise<HubspotQbrMetrics> {
  const token = await getHubspotAccessToken(account);
  const since = Date.now() - PERIOD_DAYS * 24 * 3600 * 1000;

  // Page through deals up to the cap.
  const deals: Deal[] = [];
  let after: string | undefined;
  while (deals.length < MAX_DEALS) {
    const url = new URL("https://api.hubapi.com/crm/v3/objects/deals");
    url.searchParams.set("limit", "100");
    url.searchParams.set("properties", DEAL_PROPERTIES);
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`HubSpot deals request failed (${res.status}): ${detail}`);
    }
    const json = (await res.json()) as {
      results: Deal[];
      paging?: { next?: { after?: string } };
    };
    deals.push(...json.results);
    after = json.paging?.next?.after;
    if (!after) break;
  }

  let currency = "usd";
  let openPipelineValue = 0;
  let closedWonValue = 0;
  let newDeals = 0;
  let won = 0;
  let lost = 0;
  const openDeals: { label: string; amount: number }[] = [];

  for (const d of deals) {
    const p = d.properties;
    const amount = Number.parseFloat(p.amount ?? "0") || 0;
    const isClosed = p.hs_is_closed === "true";
    const isWon = p.hs_is_closed_won === "true";
    const closed = p.closedate ? Date.parse(p.closedate) : NaN;
    const created = p.createdate ? Date.parse(p.createdate) : NaN;
    if (p.deal_currency_code) currency = p.deal_currency_code;

    if (!isClosed) {
      openPipelineValue += amount;
      openDeals.push({ label: p.dealname || "Untitled deal", amount });
    }
    if (!Number.isNaN(closed) && closed >= since) {
      if (isWon) {
        closedWonValue += amount;
        won += 1;
      } else if (isClosed) {
        lost += 1;
      }
    }
    if (!Number.isNaN(created) && created >= since) newDeals += 1;
  }

  const topOpenDeals = openDeals.sort((a, b) => b.amount - a.amount).slice(0, 5);
  const winRate = won + lost > 0 ? won / (won + lost) : null;

  return {
    currency,
    openPipelineValue,
    closedWonValue,
    newDeals,
    winRate,
    periodDays: PERIOD_DAYS,
    topOpenDeals,
  };
}

/** Formats an amount already in major currency units (HubSpot deal amounts). */
export function formatMajor(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency.toUpperCase()} ${value.toFixed(0)}`;
  }
}
