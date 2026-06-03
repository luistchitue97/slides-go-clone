import { getHubspotQbrMetrics, formatMajor } from "@/lib/integrations/hubspot-qbr";

const panelClass =
  "mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 light:border-ink-900/10 light:bg-ink-50";

type TokenAccount = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};

export async function HubspotQbrPreview({ account }: { account: TokenAccount }) {
  let metrics;
  try {
    metrics = await getHubspotQbrMetrics(account);
  } catch (err) {
    console.error("[integrations] HubSpot QBR metrics fetch failed:", err);
    return (
      <div className={panelClass}>
        <p className="text-xs text-ink-400 light:text-ink-500">
          Couldn&apos;t load HubSpot data right now. The connection is active — try refreshing in a
          moment.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Open pipeline", value: formatMajor(metrics.openPipelineValue, metrics.currency) },
    {
      label: `Closed-won · ${metrics.periodDays}d`,
      value: formatMajor(metrics.closedWonValue, metrics.currency),
    },
    { label: "New deals", value: String(metrics.newDeals) },
    {
      label: "Win rate",
      value: metrics.winRate === null ? "—" : `${Math.round(metrics.winRate * 100)}%`,
    },
  ];

  return (
    <div className={panelClass}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-accent-500">
        QBR data preview · live from HubSpot
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-ink-400 light:text-ink-500">{s.label}</p>
            <p className="mt-0.5 text-lg font-semibold text-white light:text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {metrics.topOpenDeals.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-ink-400 light:text-ink-500">Top open deals</p>
          <ul className="mt-2 divide-y divide-white/[0.06] text-sm light:divide-ink-900/8">
            {metrics.topOpenDeals.map((d, i) => (
              <li key={`${d.label}-${i}`} className="flex items-center justify-between gap-4 py-1.5">
                <span className="truncate text-ink-200 light:text-ink-700">{d.label}</span>
                <span className="shrink-0 font-mono text-ink-100 light:text-ink-800">
                  {formatMajor(d.amount, metrics.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
