"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { SortKey } from "@/lib/data";

/**
 * Search input + sort select. URL-driven (so it stays back-button friendly
 * and shareable). Search debounces lightly; sort updates on change. Pressing
 * Enter submits immediately; clearing the field is honored.
 */
export function GalleryControls({
  initialSearch,
  sort,
}: {
  initialSearch: string;
  sort: SortKey;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local state in sync with external URL changes (back/forward navigation,
  // pill clicks, etc.).
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  function push(next: URLSearchParams) {
    const qs = next.toString();
    startTransition(() => router.push(qs ? `/gallery?${qs}` : "/gallery"));
  }

  function commitSearch(value: string) {
    const next = new URLSearchParams(params.toString());
    const trimmed = value.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    push(next);
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitSearch(value), 250);
  }

  function onSortChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "alpha") next.set("sort", "alpha");
    else next.delete("sort");
    push(next);
  }

  return (
    <form
      role="search"
      aria-label="Search and sort templates"
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        commitSearch(search);
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <label className="relative flex-1">
        <span className="sr-only">Search templates</span>
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300 light:text-ink-400" />
        <input
          type="search"
          inputMode="search"
          name="q"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or tag…"
          autoComplete="off"
          className="w-full rounded-lg border border-white/10 bg-white/[0.02] py-2 pl-9 pr-3 text-sm text-white placeholder:text-ink-300 focus:border-white/25 focus:bg-white/[0.04] focus:outline-none light:border-ink-900/10 light:bg-white light:text-ink-900 light:placeholder:text-ink-400 light:focus:border-ink-900/25 light:focus:bg-white"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink-200 light:text-ink-600">
        <span className="sr-only sm:not-sr-only">Sort</span>
        <select
          name="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white focus:border-white/25 focus:bg-white/[0.04] focus:outline-none light:border-ink-900/10 light:bg-white light:text-ink-900 light:focus:border-ink-900/25"
        >
          <option value="newest">Newest</option>
          <option value="alpha">A–Z</option>
        </select>
      </label>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m17 17-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
