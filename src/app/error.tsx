"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-md flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-ink-200">
        Something went wrong
      </span>
      <h1 className="text-3xl font-semibold text-white">A small hiccup.</h1>
      <p className="text-ink-200">Try again — if it keeps happening, we&apos;ve been notified.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90"
      >
        Try again
      </button>
    </section>
  );
}
