import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types/template";
import type { SortKey } from "@/lib/data";

type Props = {
  active?: Category;
  search?: string;
  sort?: SortKey;
};

export function CategoryPills({ active, search, sort }: Props) {
  return (
    <nav aria-label="Filter by category">
      <ul className="-mx-1 flex flex-wrap gap-2 px-1">
        <li>
          <PillLink active={!active} search={search} sort={sort}>
            All
          </PillLink>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c}>
            <PillLink active={active === c} category={c} search={search} sort={sort}>
              {CATEGORY_LABELS[c]}
            </PillLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PillLink({
  active,
  category,
  search,
  sort,
  children,
}: {
  active: boolean;
  category?: Category;
  search?: string;
  sort?: SortKey;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("q", search);
  if (sort && sort !== "newest") params.set("sort", sort);
  const qs = params.toString();
  const href = qs ? `/gallery?${qs}` : "/gallery";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink-900 shadow-soft transition"
          : "inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-ink-200 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
      }
    >
      {children}
    </Link>
  );
}
