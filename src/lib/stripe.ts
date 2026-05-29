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
