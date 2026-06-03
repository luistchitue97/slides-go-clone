import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export type QbrMetrics = {
  currency: string;
  /** Estimated monthly recurring revenue, in minor units (cents). */
  mrrCents: number;
  activeSubscriptions: number;
  /** Gross succeeded-charge volume over the trailing window, in minor units. */
  revenueCents: number;
  newCustomers: number;
  churnedSubscriptions: number;
  periodDays: number;
  topAccounts: { label: string; amountCents: number }[];
};

const PERIOD_DAYS = 90;
// Hard caps so a large account can't turn this into an unbounded crawl.
const MAX_CHARGES = 1000;
const MAX_CUSTOMERS = 1000;
const MAX_CANCELED = 500;

/** Normalises a recurring price to a per-month amount. */
function monthlyFactor(interval: string | undefined, intervalCount: number): number {
  const n = intervalCount || 1;
  switch (interval) {
    case "month": return 1 / n;
    case "year":  return 1 / (12 * n);
    case "week":  return 4.345 / n;
    case "day":   return 30.4 / n;
    default:      return 0;
  }
}

/**
 * Reads QBR-relevant metrics from a connected Stripe account. All calls go
 * through the platform key with `{ stripeAccount }` (read-only). Best-effort:
 * each section is bounded and the caller handles thrown errors with a graceful
 * fallback.
 */
export async function getQbrMetrics(stripeAccountId: string): Promise<QbrMetrics> {
  const stripe = getStripe();
  const opts = { stripeAccount: stripeAccountId };
  const since = Math.floor(Date.now() / 1000) - PERIOD_DAYS * 24 * 3600;

  let currency = "usd";

  // --- Active subscriptions → MRR ---
  const activeSubs = await stripe.subscriptions
    .list({ status: "active", limit: 100 }, opts)
    .autoPagingToArray({ limit: 1000 });

  let mrrCents = 0;
  for (const sub of activeSubs) {
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price?.unit_amount) continue;
      currency = price.currency ?? currency;
      const factor = monthlyFactor(price.recurring?.interval, price.recurring?.interval_count ?? 1);
      mrrCents += price.unit_amount * (item.quantity ?? 1) * factor;
    }
  }

  // --- Gross revenue over the window + top accounts ---
  const charges = await stripe.charges
    .list({ created: { gte: since }, limit: 100 }, opts)
    .autoPagingToArray({ limit: MAX_CHARGES });

  let revenueCents = 0;
  const byCustomer = new Map<string, { label: string; amountCents: number }>();
  for (const ch of charges) {
    if (ch.status !== "succeeded" || !ch.paid) continue;
    currency = ch.currency ?? currency;
    const net = ch.amount - (ch.amount_refunded ?? 0);
    revenueCents += net;

    const key =
      (typeof ch.customer === "string" ? ch.customer : ch.customer?.id) ??
      ch.billing_details?.email ??
      ch.id;
    const label = ch.billing_details?.name || ch.billing_details?.email || key;
    const prev = byCustomer.get(key);
    byCustomer.set(key, { label, amountCents: (prev?.amountCents ?? 0) + net });
  }

  const topAccounts = [...byCustomer.values()]
    .sort((a, b) => b.amountCents - a.amountCents)
    .slice(0, 5);

  // --- New customers in the window ---
  const newCustomerList = await stripe.customers
    .list({ created: { gte: since }, limit: 100 }, opts)
    .autoPagingToArray({ limit: MAX_CUSTOMERS });
  const newCustomers = newCustomerList.length;

  // --- Churn (best-effort): subscriptions canceled within the window ---
  const canceled = await stripe.subscriptions
    .list({ status: "canceled", limit: 100 }, opts)
    .autoPagingToArray({ limit: MAX_CANCELED });
  const churnedSubscriptions = canceled.filter(
    (s: Stripe.Subscription) => (s.canceled_at ?? 0) >= since,
  ).length;

  return {
    currency,
    mrrCents: Math.round(mrrCents),
    activeSubscriptions: activeSubs.length,
    revenueCents,
    newCustomers,
    churnedSubscriptions,
    periodDays: PERIOD_DAYS,
    topAccounts,
  };
}

/** Locale-naive currency formatter for the preview UI. */
export function formatAmount(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${currency.toUpperCase()} ${(cents / 100).toFixed(0)}`;
  }
}
