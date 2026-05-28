export default function GalleryLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="flex flex-col gap-2">
        <div className="h-3 w-16 animate-pulse rounded-full bg-white/10" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="h-9 w-72 animate-pulse rounded-md bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded-md bg-white/10" />
        </div>
      </header>

      <div className="mt-8 space-y-5">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
          >
            <div className="aspect-[16/9] animate-pulse bg-white/[0.04]" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
              <div className="space-y-1.5">
                <div className="h-3 w-full animate-pulse rounded bg-white/10" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
