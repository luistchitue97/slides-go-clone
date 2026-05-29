import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { startCheckout } from "@/lib/checkout-actions";

type Props = {
  signedIn: boolean;
  allAccess: boolean;
  priceDisplay: string | null;
};

export function LandingCta({ signedIn, allAccess, priceDisplay }: Props) {
  const headline = !signedIn
    ? "Sign up and the gallery opens immediately."
    : allAccess
      ? "Pick the deck you need and open it."
      : "One-time payment. Every template, forever.";

  return (
    <section className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <Reveal
          as="div"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-ink-900 to-ink-900 p-10 shadow-lift sm:p-14"
          stagger
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-[420px] rounded-full bg-accent-500/15 blur-3xl"
          />
          <div className="relative max-w-2xl">
            <p
              data-reveal
              className="text-xs font-medium uppercase tracking-wider text-accent-500"
            >
              Ready when you are
            </p>
            <h2
              data-reveal
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              {headline}
            </h2>
            <p data-reveal className="mt-4 text-ink-200">
              {allAccess
                ? "Templates open in their own app, in a new tab — no import, no install."
                : "Free to browse. Hosted, secure auth via WorkOS — no password forms, no email confirmations to chase."}
            </p>
            <div data-reveal className="mt-7 flex flex-wrap items-center gap-3">
              <PrimaryCta
                signedIn={signedIn}
                allAccess={allAccess}
                priceDisplay={priceDisplay}
              />
              {!signedIn ? (
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06]"
                >
                  I already have one
                </Link>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PrimaryCta({ signedIn, allAccess, priceDisplay }: Props) {
  const buttonClass =
    "rounded-lg bg-white px-5 py-3 text-sm font-medium text-ink-900 shadow-lift transition hover:bg-white/90";

  if (!signedIn) {
    return (
      <Link href="/sign-up" className={buttonClass}>
        Create your account
      </Link>
    );
  }
  if (allAccess) {
    return (
      <Link href="/gallery" className={buttonClass}>
        Open the gallery
      </Link>
    );
  }
  return (
    <form action={startCheckout}>
      <button type="submit" className={buttonClass}>
        {priceDisplay ? `Get all-access — ${priceDisplay}` : "Get all-access"}
      </button>
    </form>
  );
}
