import Link from "next/link";

export default function TemplateNotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-ink-200">
        Template not found
      </span>
      <h1 className="text-3xl font-semibold text-white">That template isn&apos;t in the library.</h1>
      <p className="text-ink-200">
        It may have been retired, or the URL might be off by a letter. The gallery has the full
        current set.
      </p>
      <Link
        href="/gallery"
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90"
      >
        Browse the gallery
      </Link>
    </section>
  );
}
