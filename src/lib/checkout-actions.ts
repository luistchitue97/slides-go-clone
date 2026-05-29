"use server";

import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { getAllAccessPrice, getStripe } from "@/lib/stripe";
import { getEntitlements } from "@/lib/entitlements";
import { SITE_URL } from "@/lib/site";

/**
 * Server action that creates a Stripe Checkout Session for the all-access
 * pass and redirects the user to Stripe's hosted page.
 *
 * Form input:
 *   - `returnSlug` (optional): if the user cancels, they land back on
 *     /templates/<slug>; otherwise on /gallery.
 *
 * Already-entitled users are short-circuited to /gallery so they don't
 * accidentally double-buy.
 */
export async function startCheckout(formData: FormData) {
  const { user } = await withAuth({ ensureSignedIn: true });

  const entitlements = await getEntitlements(user.id);
  if (entitlements.allAccess) {
    redirect("/gallery?already_purchased=1");
  }

  const price = await getAllAccessPrice();
  const slug = readReturnSlug(formData);

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: price.id, quantity: 1 }],
    // Encodes the WorkOS user id so the webhook can grant access to the
    // right user, even if customer_email differs from the WorkOS email.
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    metadata: { kind: "all_access" },
    // Stripe Tax requires a customer location; Hosted Checkout collects
    // the billing address automatically when this is enabled.
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/account?purchase=success`,
    cancel_url: slug ? `${SITE_URL}/templates/${slug}` : `${SITE_URL}/gallery`,
  });

  if (!session.url) {
    throw new Error(`Stripe Checkout Session ${session.id} returned without a redirect URL`);
  }

  redirect(session.url);
}

function readReturnSlug(formData: FormData): string | undefined {
  const raw = formData.get("returnSlug");
  if (typeof raw !== "string") return undefined;
  // Slugs in our data are kebab-case ASCII. Reject anything that smells
  // like a path-traversal or URL-injection attempt.
  if (!/^[a-z0-9][a-z0-9-]{0,80}$/.test(raw)) return undefined;
  return raw;
}
