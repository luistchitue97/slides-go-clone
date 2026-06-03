import { Skeleton } from "@/components/ui/skeleton";

const cardClass =
  "rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white";

// Content-only fallback — the account layout renders the header + tabs, so
// this fills just the page area below them while settings data loads.
export default function AccountLoading() {
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

      {/* Subscription card */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="mt-5 h-9 w-40 rounded-lg" />
      </div>

      {/* Action button */}
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  );
}
