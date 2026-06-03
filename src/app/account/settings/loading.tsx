import { Skeleton } from "@/components/ui/skeleton";

const cardClass =
  "rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* User info card — 3 field rows in a 2-col grid */}
      <div className={cardClass}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "w-12", value: "w-64" },
            { label: "w-24", value: "w-8" },
            { label: "w-8", value: "w-16" },
          ].map((row, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className={`h-3 ${row.label}`} />
              <Skeleton className={`h-4 ${row.value}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Purchases card */}
      <div className={cardClass}>
        <Skeleton className="h-5 w-20" />
        <ul className="mt-4 divide-y divide-white/5 light:divide-ink-900/10">
          {[1, 2].map((i) => (
            <li key={i} className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
