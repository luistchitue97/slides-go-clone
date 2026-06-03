import Stripe from "stripe";

/**
 * Lazy Stripe client. Constructed on first call so this module is safe to
 * import during Next.js build (where env vars aren't available for
 * route-data collection).
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Set it in .env.local (sk_test_…) for local dev or in Vercel for production.",
    );
  }
  _stripe = new Stripe(key, { typescript: true });
  return _stripe;
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. Run `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally and copy the whsec_… it prints.",
    );
  }
  return secret;
}

/**
 * The subscription price, cached for the lifetime of the process. The env var
 * may hold either a raw price id (`price_…`) or a Stripe lookup_key. Using
 * a lookup_key lets us swap the underlying Price object without a code
 * deploy. The cached object also surfaces a pre-formatted display string
 * for "Subscribe — $X/mo" CTAs.
 */
export type SubscriptionPrice = {
  id: string;
  currency: string;
  unitAmountCents: number;
  /** Billing interval, e.g. "month" | "year". null for non-recurring prices. */
  interval: string | null;
  /** e.g. "$500" — locale-naive; suitable for English UIs. No interval suffix. */
  display: string;
  /** e.g. "$500/mo" — display with the interval suffix appended. */
  displayWithInterval: string;
};

export type BillingPlan = "monthly" | "yearly";

const PLAN_ENV_KEY: Record<BillingPlan, string> = {
  monthly: "STRIPE_PRICE_MONTHLY",
  yearly: "STRIPE_PRICE_YEARLY",
};

const _cachedPrices: Partial<Record<BillingPlan, SubscriptionPrice>> = {};

export async function getSubscriptionPrice(plan: BillingPlan = "monthly"): Promise<SubscriptionPrice> {
  const cached = _cachedPrices[plan];
  if (cached) return cached;

  const envKey = PLAN_ENV_KEY[plan];
  const value = process.env[envKey];
  if (!value) {
    throw new Error(
      `${envKey} is not set. Use either a raw price id (price_…) or the lookup_key you set in the Stripe dashboard.`,
    );
  }

  const stripe = getStripe();
  const price = value.startsWith("price_")
    ? await stripe.prices.retrieve(value)
    : await resolveByLookupKey(stripe, value);

  if (price.unit_amount == null) {
    throw new Error(
      `Stripe price ${price.id} has no unit_amount — it's likely a custom-price object, not a fixed-amount one`,
    );
  }

  const interval = price.recurring?.interval ?? null;
  const display = formatMoney(price.unit_amount, price.currency);

  const result: SubscriptionPrice = {
    id: price.id,
    currency: price.currency,
    unitAmountCents: price.unit_amount,
    interval,
    display,
    displayWithInterval: interval ? `${display}/${intervalSuffix(interval)}` : display,
  };
  _cachedPrices[plan] = result;
  return result;
}

function intervalSuffix(interval: string): string {
  if (interval === "month") return "mo";
  if (interval === "year") return "yr";
  if (interval === "week") return "wk";
  if (interval === "day") return "day";
  return interval;
}

async function resolveByLookupKey(stripe: Stripe, lookupKey: string): Promise<Stripe.Price> {
  const result = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = result.data[0];
  if (!price) {
    throw new Error(
      `No active Stripe price found for lookup_key="${lookupKey}". Did you set the lookup_key on the Price object in the Stripe dashboard?`,
    );
  }
  return price;
}

function formatMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    // Unknown currency code — fall back to a plain "$99" style.
    return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
  }
}
