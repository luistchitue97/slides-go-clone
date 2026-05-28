import { templates } from "@/data/templates";
import type { Category, Template } from "@/types/template";

export type TemplateQuery = {
  category?: Category;
  search?: string;
  sort?: "newest" | "alpha";
};

export async function getTemplates(query: TemplateQuery = {}): Promise<Template[]> {
  const { category, search, sort = "newest" } = query;
  const term = search?.trim().toLowerCase();

  let result = templates.filter((t) => {
    if (category && t.category !== category) return false;
    if (term) {
      const haystack = [t.title, ...t.tags, t.shortDescription].join(" ").toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  result =
    sort === "alpha"
      ? [...result].sort((a, b) => a.title.localeCompare(b.title))
      : [...result].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return result;
}

export async function getTemplate(slug: string): Promise<Template | null> {
  return templates.find((t) => t.slug === slug) ?? null;
}

export async function getFeaturedTemplates(limit = 3): Promise<Template[]> {
  return [...templates]
    .sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false))
    .slice(0, limit);
}
