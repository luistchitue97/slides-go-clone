import { getQbrMetrics, formatAmount } from "@/lib/integrations/stripe-qbr";
import { Skeleton } from "@/components/ui/skeleton";

const panelClass =
  "mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 light:border-ink-900/10 light:bg-ink-50";

export function StripeQbrPreviewSkeleton() {
  return (
    <div className={panelClass}>
      <Skeleton className="h-3 w-40" />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export async function StripeQbrPreview({ stripeAccountId }: { stripeAccountId: string }) {
  let metrics;
  try {
    metrics = await getQbrMetrics(stripeAccountId);
  } catch (err) {
    console.error("[integrations] QBR metrics fetch failed:", err);
    return (
      <div className={panelClass}>
        <p className="text-xs text-ink-400 light:text-ink-500">
          Couldn&apos;t load Stripe data right now. The connection is active — try refreshing in a
          moment.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "MRR", value: formatAmount(metrics.mrrCents, metrics.currency) },
    {
      label: `Revenue · ${metrics.periodDays}d`,
      value: formatAmount(metrics.revenueCents, metrics.currency),
    },
    { label: "Active subs", value: String(metrics.activeSubscriptions) },
    { label: "New customers", value: String(metrics.newCustomers) },
  ];

  return (
    <div className={panelClass}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-accent-500">
        QBR data preview · live from Stripe
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-ink-400 light:text-ink-500">{s.label}</p>
            <p className="mt-0.5 text-lg font-semibold text-white light:text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {metrics.topAccounts.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-ink-400 light:text-ink-500">
            Top accounts · {metrics.periodDays}d
          </p>
          <ul className="mt-2 divide-y divide-white/[0.06] text-sm light:divide-ink-900/8">
            {metrics.topAccounts.map((a) => (
              <li key={a.label} className="flex items-center justify-between gap-4 py-1.5">
                <span className="truncate text-ink-200 light:text-ink-700">{a.label}</span>
                <span className="shrink-0 font-mono text-ink-100 light:text-ink-800">
                  {formatAmount(a.amountCents, metrics.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {metrics.churnedSubscriptions > 0 ? (
        <p className="mt-3 text-xs text-ink-400 light:text-ink-500">
          {metrics.churnedSubscriptions} subscription
          {metrics.churnedSubscriptions === 1 ? "" : "s"} canceled in the last {metrics.periodDays}{" "}
          days.
        </p>
      ) : null}
    </div>
  );
}
