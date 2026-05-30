import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import { db } from "@/db";
import { appUsers, purchases } from "@/db/schema";
import { sendPurchaseWelcomeEmail } from "@/lib/email";

/**
 * Stripe → DeckForge webhook.
 *
 * This is the *only* place where access is granted. Never trust the
 * post-payment redirect — users close browsers, networks drop, retries
 * happen. The unique constraint on purchases.stripe_session_id makes
 * Stripe's automatic retries safe.
 *
 * The handler runs on the Node runtime because Stripe's signature
 * verification uses Node-compatible crypto.
 */

export const runtime = "nodejs";
// Stripe sends the raw body; ensure Next never caches a response.
export const dynamic = "force-dynamic";

// Allowlist of values we accept in session.metadata.kind. Extend here when
// adding per-template purchases (e.g. /^template:[a-z0-9-]+$/ matchers).
const KNOWN_PURCHASE_KINDS = new Set(["all_access"]);

// Stripe sets "paid" for normal charges and "no_payment_required" when a
// 100%-off promotion code (e.g. a friends-and-family comp) zeros the total.
// Both should grant access; everything else (async payments, failures) shouldn't.
const FULFILLABLE_PAYMENT_STATUSES = new Set<Stripe.Checkout.Session["payment_status"]>([
  "paid",
  "no_payment_required",
]);

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  // Raw body, untouched, is required for signature verification.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object);
        break;
      }
      default:
        // We intentionally ignore other event types. Returning 200 stops
        // Stripe from retrying events we have no use for.
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] handler error for ${event.type}:`, err);
    // 500 makes Stripe retry — appropriate for transient DB failures.
    return new NextResponse("Handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Grant only when the session is fully settled: a normal "paid" charge or a
  // promo-code-discounted session that doesn't require payment at all.
  // Async payment methods (bank debits) can complete and *then* fail later
  // — we'd handle those in checkout.session.async_payment_* when/if we accept
  // those rails.
  if (!FULFILLABLE_PAYMENT_STATUSES.has(session.payment_status)) {
    console.warn(
      `[stripe/webhook] checkout.session.completed with payment_status=${session.payment_status}; ignoring`,
    );
    return;
  }

  const workosUserId = session.client_reference_id;
  if (!workosUserId) {
    throw new Error(
      `Checkout session ${session.id} has no client_reference_id — every session we create must set it to the WorkOS user id`,
    );
  }

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    throw new Error(`Checkout session ${session.id} has no customer email`);
  }

  // Kind allowlist — defense in depth. Even with a valid signature, we
  // refuse to write an unknown kind into purchases (would otherwise let
  // a leaked webhook secret or an attacker who tricks our checkout flow
  // into using a junk metadata value pollute the table).
  const rawKind = (session.metadata?.kind ?? "all_access").toString();
  if (!KNOWN_PURCHASE_KINDS.has(rawKind)) {
    console.warn(
      `[stripe/webhook] unknown kind="${rawKind}" on session ${session.id}; ignoring`,
    );
    return;
  }
  const kind = rawKind;

  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency ?? "usd").toLowerCase();

  // Upsert the user row so the FK from purchases always resolves. Keeping
  // the email fresh on conflict means a later email change in WorkOS
  // propagates the next time the user buys something.
  await db
    .insert(appUsers)
    .values({ id: workosUserId, email })
    .onConflictDoUpdate({ target: appUsers.id, set: { email } });

  // Idempotent on session id: a duplicate webhook delivery becomes a no-op.
  // .returning() lets us tell first-write from no-op so the welcome email
  // only fires once per purchase even if Stripe retries the delivery.
  const inserted = await db
    .insert(purchases)
    .values({
      userId: workosUserId,
      kind,
      stripeSessionId: session.id,
      amountCents,
      currency,
    })
    .onConflictDoNothing({ target: purchases.stripeSessionId })
    .returning({ id: purchases.id });

  if (inserted.length > 0) {
    // Email failures must not 500 the webhook (Stripe would retry, the insert
    // would no-op, but no email would ever go out since this branch is skipped
    // on retries). Log + swallow.
    try {
      await sendPurchaseWelcomeEmail({ to: email });
    } catch (err) {
      console.error(`[stripe/webhook] welcome email failed for session ${session.id}:`, err);
    }
  }
}
