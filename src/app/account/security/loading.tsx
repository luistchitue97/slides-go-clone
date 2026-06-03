import { Skeleton } from "@/components/ui/skeleton";

export default function SecurityLoading() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <Skeleton className="mt-0.5 size-9 shrink-0 rounded-lg" />
              <div className="flex flex-col gap-2 pt-0.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-72" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 shrink-0 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
