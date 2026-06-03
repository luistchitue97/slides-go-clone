import { Skeleton } from "@/components/ui/skeleton";

const cardClass =
  "rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white";

const dividerClass = "divide-y divide-white/[0.06] light:divide-ink-900/8";

export default function OrganizationsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Org switcher */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-36 rounded-lg" />
        </div>
        <ul className={`mt-4 ${dividerClass}`}>
          {[1, 2].map((i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </li>
          ))}
        </ul>
      </div>

      {/* Org identity */}
      <div className={cardClass}>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-2 h-7 w-48" />
        <Skeleton className="mt-1.5 h-3 w-64" />
      </div>

      {/* Members */}
      <div className={cardClass}>
        <Skeleton className="h-5 w-32" />
        <ul className={`mt-4 ${dividerClass}`}>
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </li>
          ))}
        </ul>
      </div>

      {/* Invite */}
      <div className={cardClass}>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-1 h-3.5 w-64" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
