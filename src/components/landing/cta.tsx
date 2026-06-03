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
    ? "Turn company data into executive narratives."
    : allAccess
      ? "Pick the deck you need and open it."
      : "One subscription. Every report, every integration.";

  return (
    <section className="border-t border-white/5 light:border-ink-900/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <Reveal
          as="div"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/30 via-ink-900 to-ink-900 p-10 shadow-lift sm:p-14 light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white"
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
              {allAccess ? "Ready when you are" : "Early access"}
            </p>
            <h2
              data-reveal
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl light:text-ink-900"
            >
              {headline}
            </h2>
            <p data-reveal className="mt-4 text-ink-200 light:text-ink-600">
              {allAccess
                ? "Reports open in their own app, in a new tab — no import, no install."
                : "Stop rebuilding the same presentations every quarter. Connect your stack, generate your deck, and walk into the meeting ready."}
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
                  className="rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06] light:border-ink-900/15 light:bg-transparent light:text-ink-900 light:hover:bg-ink-900/5"
                >
                  Sign in
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
    "rounded-lg bg-white px-5 py-3 text-sm font-medium text-ink-900 shadow-lift transition hover:bg-white/90 light:bg-ink-900 light:text-white light:hover:bg-ink-800";

  if (!signedIn) {
    return (
      <Link href="/sign-up" className={buttonClass}>
        Request access
      </Link>
    );
  }
  if (allAccess) {
    return (
      <Link href="/reports" className={buttonClass}>
        Open the gallery
      </Link>
    );
  }
  return (
    <form action={startCheckout}>
      <button type="submit" className={buttonClass}>
        {priceDisplay ? `Subscribe — ${priceDisplay}` : "Subscribe"}
      </button>
    </form>
  );
}
