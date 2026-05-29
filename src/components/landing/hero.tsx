import Link from "next/link";
import Image from "next/image";
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
      {/* Ambient gradient — purely decorative, ignored by AT. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[640px] max-w-6xl"
      >
        <div className="absolute left-1/2 top-0 size-[640px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute right-0 top-32 size-[320px] rounded-full bg-accent-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:grid lg:grid-cols-12 lg:gap-12 lg:pt-32">
        <Reveal as="div" className="lg:col-span-7" stagger immediate>
          <p
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-wider text-ink-200"
          >
            <span className="size-1.5 rounded-full bg-accent-500" />
            {allAccess ? "All-access active" : "New decks every week"}
          </p>
          <h1
            data-reveal
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-[68px] lg:leading-[1.04]"
          >
            Business decks that don&apos;t look templated.
          </h1>
          <p data-reveal className="mt-6 max-w-xl text-lg text-ink-200 sm:text-xl">
            A curated library of premium presentation templates — pitches, QBRs, sales playbooks,
            finance reports. Open the one you need in a single click.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryCta
              signedIn={signedIn}
              allAccess={allAccess}
              priceDisplay={priceDisplay}
            />
            <Link
              href="/gallery"
              className="rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Browse templates
            </Link>
          </div>
          <p data-reveal className="mt-4 text-sm text-ink-300">
            {allAccess
              ? "Templates open in their own app, in a new tab."
              : signedIn
                ? "One-time payment. Lifetime access. 30-day money-back guarantee."
                : "Free to browse. 30-day money-back guarantee on all-access."}
          </p>
        </Reveal>

        {/* Decorative preview card */}
        <Reveal
          as="div"
          className="relative mt-14 lg:col-span-5 lg:mt-0"
          immediate
          y={32}
          duration={0.9}
        >
          <div
            data-reveal
            className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-lift"
          >
            <Image
              src="/templates/placeholder-north-star.svg"
              alt=""
              role="presentation"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink-950/40 via-transparent to-transparent" />
          </div>
          <div
            data-reveal
            className="absolute -bottom-6 -left-6 hidden w-56 rotate-[-3deg] rounded-xl border border-white/10 bg-ink-900/90 p-4 shadow-lift backdrop-blur sm:block"
          >
            <p className="text-xs uppercase tracking-wider text-ink-300">Featured</p>
            <p className="mt-1 text-sm font-medium text-white">Quarterly Business Review</p>
            <p className="mt-1 text-xs text-ink-300">Exec narrative · KPI dashboards</p>
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
        Get started — free
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
