import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import { db } from "@/db";
import { appUsers, purchases } from "@/db/schema";

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
  // The Checkout Session is only considered paid once payment_status is "paid".
  // Sessions for asynchronous payment methods (e.g. bank debits) can complete
  // and *then* fail later — we'd handle those in checkout.session.async_payment_*
  // when/if we accept those rails.
  if (session.payment_status !== "paid") {
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
  await db
    .insert(purchases)
    .values({
      userId: workosUserId,
      kind,
      stripeSessionId: session.id,
      amountCents,
      currency,
    })
    .onConflictDoNothing({ target: purchases.stripeSessionId });
}
