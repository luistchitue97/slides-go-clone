import { withAuth } from "@workos-inc/authkit-nextjs";
import { Hero } from "@/components/landing/hero";
import { ValueProps } from "@/components/landing/value-props";
import { FeaturedTemplates } from "@/components/landing/featured-templates";
import { LandingCta } from "@/components/landing/cta";

export default async function LandingPage() {
  const { user } = await withAuth();
  const signedIn = Boolean(user);

  return (
    <>
      <Hero signedIn={signedIn} />
      <ValueProps />
      <FeaturedTemplates />
      <LandingCta signedIn={signedIn} />
    </>
  );
}
