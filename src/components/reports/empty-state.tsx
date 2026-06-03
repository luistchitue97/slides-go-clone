import Link from "next/link";
import { CATEGORY_LABELS, type Category } from "@/types/template";

export function EmptyState({
  search,
  category,
}: {
  search?: string;
  category?: Category;
}) {
  const bits: string[] = [];
  if (search) bits.push(`"${search}"`);
  if (category) bits.push(`in ${CATEGORY_LABELS[category]}`);
  const detail = bits.length ? ` for ${bits.join(" ")}` : "";

  return (
    <div className="mt-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center light:border-ink-900/10 light:bg-white">
      <h2 className="text-lg font-medium text-white light:text-ink-900">No reports match{detail}.</h2>
      <p className="mt-2 text-sm text-ink-200 light:text-ink-600">
        Try a different category or clear your search.
      </p>
      <Link
        href="/reports"
        className="mt-6 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 light:border-ink-900/15 light:text-ink-900 light:hover:bg-ink-900/5"
      >
        Reset filters
      </Link>
    </div>
  );
}
