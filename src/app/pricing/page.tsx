import Link from "next/link";
import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { Reveal } from "@/components/motion/reveal";
import { getEntitlements } from "@/lib/entitlements";
import { getSubscriptionPrice } from "@/lib/stripe";
import { startCheckout } from "@/lib/checkout-actions";
import { openBillingPortal } from "@/lib/billing-actions";

export const metadata: Metadata = {
  title: "Pricing — One plan. Everything included.",
  description:
    "Full access to every DeckForge executive report template and integration for one monthly subscription. Cancel anytime.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "DeckForge Pricing",
    description:
      "One monthly subscription. Every report template and integration, current and future.",
    type: "website",
  },
};

const FEATURES = [
  "Every report template — current and future",
  "All data integrations included",
  "New templates added every week",
  "Open any report in one click — no import, no install",
  "Priority support",
  "Cancel anytime, no lock-in",
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What's included?",
    a: "Every report template and integration available today, plus everything we add later. One plan, no tiers — you get all of it.",
  },
  {
    q: "How does billing work?",
    a: "It's a monthly subscription billed automatically each month. You can cancel anytime from your account's billing portal; access continues until the end of the period you've paid for.",
  },
  {
    q: "Will I get future templates?",
    a: "Yes. New templates land roughly every week and appear in your reports automatically — included in your subscription at no extra cost.",
  },
  {
    q: "Can I cancel or get a refund?",
    a: "Cancel anytime — you keep access through the end of the current billing period. For refund requests, reply to any receipt email within 30 days and we'll sort it out.",
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
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-wider text-ink-200 light:border-ink-900/10 light:bg-ink-100/60 light:text-ink-500"
            >
              <span className="size-1.5 rounded-full bg-accent-500" />
              Pricing
            </p>
            <h1
              data-reveal
              className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl light:text-ink-900"
            >
              One plan. Everything included.
            </h1>
            <p data-reveal className="mt-5 text-lg text-ink-200 light:text-ink-600">
              No tiers, no add-ons. One monthly subscription unlocks every report template and
              integration DeckForge ships — current and future. Cancel anytime.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <Reveal
          as="div"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-8 shadow-lift sm:p-12 light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white"
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
                DeckForge Subscription
              </p>
              {allAccess ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    <CheckIcon className="size-7 text-emerald-300" />
                    Active
                  </span>
                  <span className="text-sm text-ink-300">subscription</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl light:text-ink-900">
                    {price?.display ?? "—"}
                  </span>
                  <span className="text-sm text-ink-300 light:text-ink-500">
                    {price?.interval ? `per ${price.interval} · cancel anytime` : "cancel anytime"}
                  </span>
                </div>
              )}
            </div>

            <ul data-reveal className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink-100 light:text-ink-700">
                  <CheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div data-reveal className="mt-9">
              <PrimaryCta
                signedIn={signedIn}
                allAccess={allAccess}
                priceDisplay={price?.displayWithInterval ?? null}
              />
              <p className="mt-3 text-xs text-ink-300 light:text-ink-500">
                {allAccess
                  ? "Reports open in their own app, in a new tab. Manage your subscription on the account page."
                  : signedIn
                    ? "Secure checkout via Stripe. Cancel anytime. Tax calculated automatically at checkout."
                    : "Free to browse. Subscribe when you're ready to open a report."}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-white/5 light:border-ink-900/10">
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
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl light:text-ink-900"
            >
              What you need to know.
            </h2>
          </Reveal>

          <Reveal as="ul" className="mt-10 divide-y divide-white/10 light:divide-ink-900/10" stagger>
            {FAQ.map((item) => (
              <li key={item.q} data-reveal>
                <details className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-white light:text-ink-900">
                    <span>{item.q}</span>
                    <span
                      aria-hidden
                      className="text-ink-300 transition group-open:rotate-45 light:text-ink-500"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200 light:text-ink-600">{item.a}</p>
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
    "inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-ink-900 shadow-lift transition hover:bg-white/90 sm:w-auto light:bg-ink-900 light:text-white light:hover:bg-ink-800";
  const secondaryButtonClass =
    "inline-flex w-full items-center justify-center rounded-lg border border-white/15 bg-white/[0.02] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06] sm:w-auto light:border-ink-900/15 light:bg-transparent light:text-ink-900 light:hover:bg-ink-900/5";

  if (allAccess) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/reports" className={buttonClass}>
          Open reports
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
        {priceDisplay ? `Subscribe — ${priceDisplay}` : "Subscribe"}
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
    return await getSubscriptionPrice();
  } catch (err) {
    console.error("[pricing] failed to load all-access price:", err);
    return null;
  }
}
