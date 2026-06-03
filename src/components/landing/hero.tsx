import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { startCheckout } from "@/lib/checkout-actions";

type Props = {
  signedIn: boolean;
  allAccess: boolean;
  /** Pre-formatted price string from getAllAccessPrice, or null on misconfig. */
  priceDisplay: string | null;
};

export function Hero({ signedIn, allAccess, priceDisplay }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Dark gradient overlays for text legibility in dark mode — hidden in light mode. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 light:hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#030d1e]/80 via-[#030d1e]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030d1e]/50 via-transparent to-[#030d1e]/60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:pt-32">
        <Reveal as="div" className="max-w-3xl" stagger immediate>
          <p
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-wider text-ink-200 light:border-ink-900/10 light:bg-ink-100/60 light:text-ink-500"
          >
            <span className="size-1.5 rounded-full bg-accent-500" />
            {allAccess ? "Subscription active" : "AI-Native Reporting Platform"}
          </p>
          <h1
            data-reveal
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-[68px] lg:leading-[1.04] light:text-ink-900"
          >
            Your company data.{" "}
            <span className="text-ink-300 light:text-ink-500">Turned into executive-ready decks.</span>
          </h1>
          <p data-reveal className="mt-6 max-w-xl text-lg text-ink-200 sm:text-xl light:text-ink-600">
            Auto-generate QBRs, board decks, and investor updates from your live data — cinematic,
            web-native, fully editable.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryCta
              signedIn={signedIn}
              allAccess={allAccess}
              priceDisplay={priceDisplay}
            />
            <Link
              href="/reports"
              className="rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06] light:border-ink-900/15 light:bg-transparent light:text-ink-900 light:hover:bg-ink-900/5"
            >
              Browse templates
            </Link>
          </div>
          <p data-reveal className="mt-4 text-sm text-ink-300 light:text-ink-500">
            {allAccess
              ? "Templates open in their own app, in a new tab."
              : "Built for founders, operators, consultants, and revenue teams."}
          </p>
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
        Get early access
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
      <button type="submit" className={buttonClass} suppressHydrationWarning>
        {priceDisplay ? `Subscribe — ${priceDisplay}` : "Subscribe"}
      </button>
    </form>
  );
}
