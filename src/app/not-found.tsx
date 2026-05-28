import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-ink-200">
        404
      </span>
      <h1 className="text-3xl font-semibold text-white">We couldn&apos;t find that page.</h1>
      <p className="text-ink-200">
        The template or page you&apos;re looking for might have moved or never existed.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90"
      >
        Back to home
      </Link>
    </section>
  );
}
