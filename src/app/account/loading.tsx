import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-44" />
      </header>

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-white/10 pb-3 light:border-ink-900/10">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Content area */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </section>
  );
}
