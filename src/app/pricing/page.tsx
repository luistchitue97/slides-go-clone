import Link from "next/link";
import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { Reveal } from "@/components/motion/reveal";
import { getEntitlements } from "@/lib/entitlements";
import { getAllAccessPrice } from "@/lib/stripe";
import { startCheckout } from "@/lib/checkout-actions";
import { openBillingPortal } from "@/lib/billing-actions";

export const metadata: Metadata = {
  title: "Pricing — One price. Every template. Forever.",
  description:
    "Lifetime access to every DeckForge business presentation template — current and future. One-time payment, no subscription.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "DeckForge Pricing",
    description:
      "One-time payment. Lifetime access to every business presentation template in DeckForge.",
    type: "website",
  },
};

const FEATURES = [
  "Every template in the library — current and future",
  "New templates added every week",
  "Open any template in one click — no import, no install",
  "Designed for boardrooms and 13\" laptops alike",
  "Built by people who present for a living",
  "Pay once. Yours forever.",
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What's included?",
    a: "Every template in the gallery today, plus every template we add later. There is no \"premium tier\" — once you have all-access, you have all of it.",
  },
  {
    q: "Is this a subscription?",
    a: "No. It's a one-time payment for lifetime access. Pay once, never get billed again.",
  },
  {
    q: "Will I get future templates?",
    a: "Yes. New templates land roughly every week. You get them automatically — they appear in the gallery the day they ship.",
  },
  {
    q: "Can I get a refund?",
    a: "Within 30 days of purchase, just reply to your receipt email and we'll refund you, no questions. After 30 days the sale is final.",
  },
];

export default async function PricingPage() {
  const { user } = await withAuth();
  const signedIn = Boolean(user);

  const [entitlements, price] = await Promise.all([
    getEntitlements(user?.id),
    getAllAccessPriceSafe(),
  ]);
  const allAccess = entitlements.allAccess;

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 mx-auto h-[520px] max-w-6xl"
        >
          <div className="absolute left-1/2 top-0 size-[520px] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-24 text-center sm:px-6 sm:pt-28">
          <Reveal as="div" stagger immediate>
            <p
              data-reveal
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-wider text-ink-200"
            >
              <span className="size-1.5 rounded-full bg-accent-500" />
              Pricing
            </p>
            <h1
              data-reveal
              className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              One price. Every template. Forever.
            </h1>
            <p data-reveal className="mt-5 text-lg text-ink-200">
              No subscription. No tiers. Pay once and get everything DeckForge ships — current and
              future.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <Reveal
          as="div"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-8 shadow-lift sm:p-12"
          stagger
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-accent-500/15 blur-3xl"
          />
          <div className="relative">
            <div data-reveal className="flex flex-col gap-2">
              <p
                className={
                  allAccess
                    ? "text-xs font-medium uppercase tracking-wider text-emerald-300"
                    : "text-xs font-medium uppercase tracking-wider text-accent-500"
                }
              >
                DeckForge All-Access
              </p>
              {allAccess ? (
                <div className="flex items-baseline gap-3">
                  <span className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    <CheckIcon className="size-7 text-emerald-300" />
                    Active
                  </span>
                  <span className="text-sm text-ink-300">lifetime access</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-white">
                    {price?.display ?? "—"}
                  </span>
                  <span className="text-sm text-ink-300">one-time · lifetime access</span>
                </div>
              )}
            </div>

            <ul data-reveal className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink-100">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div data-reveal className="mt-9">
              <PrimaryCta
                signedIn={signedIn}
                allAccess={allAccess}
                priceDisplay={price?.display ?? null}
              />
              <p className="mt-3 text-xs text-ink-300">
                {allAccess
                  ? "Templates open in their own app, in a new tab. Manage billing on the account page."
                  : signedIn
                    ? "Secure checkout via Stripe. Tax calculated automatically at checkout."
                    : "Free to browse the gallery. Pay only when you want to open a template."}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-white/5">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <Reveal as="div" stagger>
            <p
              data-reveal
              className="text-xs font-medium uppercase tracking-wider text-accent-500"
            >
              Common questions
            </p>
            <h2
              data-reveal
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              What you need to know.
            </h2>
          </Reveal>

          <Reveal as="ul" className="mt-10 divide-y divide-white/10" stagger>
            {FAQ.map((item) => (
              <li key={item.q} data-reveal>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="text-ink-300 transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200">{item.a}</p>
                </details>
              </li>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PrimaryCta({
  signedIn,
  allAccess,
  priceDisplay,
}: {
  signedIn: boolean;
  allAccess: boolean;
  priceDisplay: string | null;
}) {
  const buttonClass =
    "inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-ink-900 shadow-lift transition hover:bg-white/90 sm:w-auto";
  const secondaryButtonClass =
    "inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06] sm:w-auto";

  if (allAccess) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/gallery" className={buttonClass}>
          Open the gallery
        </Link>
        <form action={openBillingPortal}>
          <button type="submit" className={secondaryButtonClass}>
            Manage billing
          </button>
        </form>
      </div>
    );
  }
  if (!signedIn) {
    return (
      <Link href="/sign-up?returnTo=%2Fpricing" className={buttonClass}>
        Get started — sign up first
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 10.5l3 3 7-7" />
    </svg>
  );
}

async function getAllAccessPriceSafe() {
  try {
    return await getAllAccessPrice();
  } catch (err) {
    console.error("[pricing] failed to load all-access price:", err);
    return null;
  }
}
