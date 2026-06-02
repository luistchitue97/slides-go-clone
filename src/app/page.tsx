import { withAuth } from "@workos-inc/authkit-nextjs";
import { Hero } from "@/components/landing/hero";
import { IntegrationTicker } from "@/components/landing/integration-ticker";
import { ValueProps } from "@/components/landing/value-props";
import { FeaturedTemplates } from "@/components/landing/featured-templates";
import { LandingCta } from "@/components/landing/cta";
import { getEntitlements } from "@/lib/entitlements";
import { getAllAccessPrice } from "@/lib/stripe";

export default async function LandingPage() {
  const { user } = await withAuth();
  const signedIn = Boolean(user);

  const entitlements = await getEntitlements(user?.id);
  const allAccess = entitlements.allAccess;

  // Only signed-in, unentitled users see a price-tagged CTA. Signed-out
  // visitors get the marketing flow; entitled users get the "open the
  // gallery" flow. Failing to resolve the price degrades the CTA to a
  // generic "Get all-access" label.
  const price = signedIn && !allAccess ? await getAllAccessPriceSafe() : null;

  return (
    <>
      <Hero signedIn={signedIn} allAccess={allAccess} priceDisplay={price?.display ?? null} />
      <IntegrationTicker />
      <ValueProps />
      <FeaturedTemplates signedIn={signedIn} allAccess={allAccess} />
      <LandingCta
        signedIn={signedIn}
        allAccess={allAccess}
        priceDisplay={price?.display ?? null}
      />
    </>
  );
}

async function getAllAccessPriceSafe() {
  try {
    return await getAllAccessPrice();
  } catch (err) {
    console.error("[landing] failed to load all-access price:", err);
    return null;
  }
}
