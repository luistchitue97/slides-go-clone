import { templates } from "@/data/templates";
import { CATEGORIES, type Category, type Template } from "@/types/template";

// Per-template launch URL is provided per environment via env vars named by
// the template's order in the data array (NEXT_PUBLIC_TEMPLATE_ONE_URL …
// NEXT_PUBLIC_TEMPLATE_NINE_URL). Keeping the mapping here means callers
// don't have to know which slug maps to which env var.
const ORDER_WORDS = [
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
] as const;

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

/**
 * Resolve the per-environment launch URL for a template by its order in the
 * data array (1-based: north-star-pitch → ONE, quarterly-business-review →
 * TWO, …). Returns null if the slug isn't recognized or its env var isn't
 * set in the current environment.
 */
export function getTemplateOrderUrl(slug: string): string | null {
  const i = templates.findIndex((t) => t.slug === slug);
  if (i < 0 || i >= ORDER_WORDS.length) return null;
  const url = process.env[`NEXT_PUBLIC_TEMPLATE_${ORDER_WORDS[i]}_URL`];
  return url && url.length > 0 ? url : null;
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
