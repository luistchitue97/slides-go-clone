"use server";

import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

/**
 * Server action that opens the Stripe Billing Portal for the current user.
 *
 * The portal lets the user view past invoices/receipts and update payment
 * methods. We don't store the Stripe customer id on our side (avoids a
 * schema migration); instead we look the customer up by email, which Stripe
 * guarantees is unique per Stripe account when created via Checkout.
 *
 * Users who haven't purchased anything get redirected to /pricing — Stripe
 * would refuse to create a portal session for a non-existent customer.
 */
export async function openBillingPortal() {
  const { user } = await withAuth({ ensureSignedIn: true });
  if (!user.email) {
    throw new Error("Signed-in user has no email — cannot open billing portal");
  }

  const stripe = getStripe();
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  const customer = customers.data[0];
  if (!customer) {
    redirect("/pricing");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${SITE_URL}/account`,
  });
  redirect(session.url);
}
