import { templates } from "@/data/templates";
import { CATEGORIES, type Category, type Template } from "@/types/template";

export type SortKey = "newest" | "alpha";

export type TemplateQuery = {
  category?: Category;
  search?: string;
  sort?: SortKey;
};

export async function getTemplates(query: TemplateQuery = {}): Promise<Template[]> {
  const { category, search, sort = "newest" } = query;
  const term = search?.trim().toLowerCase();

  const filtered = templates.filter((t) => {
    if (category && t.category !== category) return false;
    if (term) {
      const haystack = [t.title, ...t.tags, t.shortDescription].join(" ").toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  return sort === "alpha"
    ? [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    : [...filtered].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getTemplate(slug: string): Promise<Template | null> {
  return templates.find((t) => t.slug === slug) ?? null;
}

export async function getFeaturedTemplates(limit = 3): Promise<Template[]> {
  return [...templates]
    .sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false))
    .slice(0, limit);
}

/** Narrow a free-form search-param value to a known Category, else undefined. */
export function parseCategory(value: string | string[] | undefined): Category | undefined {
  if (typeof value !== "string") return undefined;
  return (CATEGORIES as readonly string[]).includes(value) ? (value as Category) : undefined;
}

export function parseSort(value: string | string[] | undefined): SortKey {
  return value === "alpha" ? "alpha" : "newest";
}

export function parseSearch(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed.slice(0, 100);
}
