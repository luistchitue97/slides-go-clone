"use client";

import { useState } from "react";
import Link from "next/link";
import { startCheckout } from "@/lib/checkout-actions";
import type { SubscriptionPrice } from "@/lib/stripe";

type Props = {
  signedIn: boolean;
  monthly: SubscriptionPrice | null;
  yearly: SubscriptionPrice | null;
  /** Whole-number percent saved on yearly vs 12× monthly, or null. */
  savingsPct: number | null;
  /** Pre-formatted per-month equivalent of the yearly price, e.g. "$450". */
  yearlyPerMonthDisplay: string | null;
  features: string[];
};

const buttonClass =
  "inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-medium text-ink-900 shadow-lift transition hover:bg-white/90 sm:w-auto light:bg-ink-900 light:text-white light:hover:bg-ink-800";

export function PlanSelector({
  signedIn,
  monthly,
  yearly,
  savingsPct,
  yearlyPerMonthDisplay,
  features,
}: Props) {
  const hasYearly = Boolean(yearly);
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const selected = plan === "yearly" && yearly ? yearly : monthly;

  return (
    <div data-reveal>
      {/* Billing-interval tabs — centered and prominent at the top of the card */}
      {hasYearly ? (
        <div
          role="tablist"
          aria-label="Billing interval"
          className="mx-auto mb-8 grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-sm light:border-ink-900/10 light:bg-ink-100/60"
        >
          <ToggleButton active={plan === "monthly"} onClick={() => setPlan("monthly")}>
            Monthly
          </ToggleButton>
          <ToggleButton active={plan === "yearly"} onClick={() => setPlan("yearly")}>
            Yearly
            {savingsPct ? (
              <span className="ml-1.5 rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                −{savingsPct}%
              </span>
            ) : null}
          </ToggleButton>
        </div>
      ) : null}

      <p className="text-xs font-medium uppercase tracking-wider text-accent-500">
        DeckForge Subscription
      </p>

      {/* Price */}
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl light:text-ink-900">
          {selected?.display ?? "—"}
        </span>
        <span className="text-sm text-ink-300 light:text-ink-500">
          {plan === "yearly" ? "per year · cancel anytime" : "per month · cancel anytime"}
        </span>
      </div>
      {plan === "yearly" && yearlyPerMonthDisplay ? (
        <p className="mt-1 text-sm text-ink-400 light:text-ink-500">
          {yearlyPerMonthDisplay}/mo, billed annually
        </p>
      ) : null}

      {/* Features */}
      <ul className="mt-8 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-ink-100 light:text-ink-700">
            <CheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-300" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-9">
        {signedIn ? (
          <form action={startCheckout}>
            <input type="hidden" name="plan" value={plan} />
            <button type="submit" className={buttonClass}>
              {selected?.displayWithInterval ? `Subscribe — ${selected.displayWithInterval}` : "Subscribe"}
            </button>
          </form>
        ) : (
          <Link href="/sign-up?returnTo=%2Fpricing" className={buttonClass}>
            Get started — sign up first
          </Link>
        )}
        <p className="mt-3 text-xs text-ink-300 light:text-ink-500">
          {signedIn
            ? "Secure checkout via Stripe. Cancel anytime. Tax calculated automatically at checkout."
            : "Free to browse. Subscribe when you're ready to open a report."}
        </p>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 font-medium transition ${
        active
          ? "bg-white text-ink-900 shadow-soft light:bg-ink-900 light:text-white"
          : "text-ink-300 hover:text-white light:text-ink-500 light:hover:text-ink-900"
      }`}
    >
      {children}
    </button>
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
