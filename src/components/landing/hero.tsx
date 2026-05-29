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

/**
 * Decorative right-side bento. Each cell shows one of the existing
 * placeholder template SVGs at varying sizes. The container is masked
 * toward the left so the headline never fights for legibility, and the
 * overall opacity stays low enough that the section reads as background.
 * Swap any `src` for a real template screenshot when you have them.
 */
const BENTO_CELLS: Array<{ src: string; className: string }> = [
  {
    src: "/templates/placeholder-north-star.svg",
    className: "col-span-2 row-span-2",
  },
  {
    src: "/templates/placeholder-qbr.svg",
    className: "col-span-1 row-span-2",
  },
  {
    src: "/templates/placeholder-data-room.svg",
    className: "col-span-1 row-span-2",
  },
  {
    src: "/templates/placeholder-revenue.svg",
    className: "col-span-2 row-span-1",
  },
  {
    src: "/templates/placeholder-growth.svg",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/templates/placeholder-fpa.svg",
    className: "col-span-1 row-span-1",
  },
];

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

      {/* Bento wall of template cards — sits behind the text on lg+ screens,
          fades out toward the left via a mask gradient so the headline stays
          readable. Hidden entirely below lg where the layout would clash. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] xl:w-[55%] lg:block"
      >
        <div className="absolute inset-0 opacity-[0.22] [mask-image:linear-gradient(to_right,transparent,black_35%,black)]">
          <div className="grid h-full w-full grid-cols-4 grid-rows-3 gap-2 p-4 sm:gap-3 sm:p-6">
            {BENTO_CELLS.map((cell) => (
              <div
                key={cell.src}
                className={`relative overflow-hidden rounded-lg border border-white/15 bg-ink-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${cell.className}`}
              >
                <Image
                  src={cell.src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 220px, (min-width: 1024px) 180px, 0px"
                  className="object-cover"
                />
                {/* Subtle silver sheen for the metallic-grid feel. */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28 lg:pt-32">
        <Reveal as="div" className="max-w-3xl" stagger immediate>
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
