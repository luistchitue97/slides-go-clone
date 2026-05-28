import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-ink-200">
        Phase 0 · scaffold
      </span>
      <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Business decks that don&apos;t look templated.
      </h1>
      <p className="max-w-2xl text-lg text-ink-200">
        DeckForge is a curated library of premium presentation templates. Sign in to browse the
        gallery; templates open in their own deployed apps in a new tab.
      </p>
      <div className="flex gap-3">
        <Link
          href="/sign-up"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90"
        >
          Get started
        </Link>
        <Link
          href="/gallery"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
        >
          Browse gallery
        </Link>
      </div>
    </section>
  );
}
