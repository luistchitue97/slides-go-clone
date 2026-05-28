import { CategoryPills } from "@/components/gallery/category-pills";
import { GalleryControls } from "@/components/gallery/gallery-controls";
import { EmptyState } from "@/components/gallery/empty-state";
import { TemplateCard } from "@/components/templates/template-card";
import { Reveal } from "@/components/motion/reveal";
import { getTemplates, parseCategory, parseSearch, parseSort } from "@/lib/data";

export const metadata = {
  title: "Gallery",
  description: "Browse the full library of DeckForge business presentation templates.",
};

type SearchParams = Promise<{ category?: string; q?: string; sort?: string }>;

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const category = parseCategory(raw.category);
  const search = parseSearch(raw.q);
  const sort = parseSort(raw.sort);

  const templates = await getTemplates({ category, search, sort });
  const count = templates.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <Reveal as="header" className="flex flex-col gap-2" stagger immediate>
        <p
          data-reveal
          className="text-xs font-medium uppercase tracking-wider text-accent-500"
        >
          Gallery
        </p>
        <div data-reveal className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Browse the library
          </h1>
          <p className="text-sm text-ink-300" aria-live="polite">
            {count} template{count === 1 ? "" : "s"}
          </p>
        </div>
      </Reveal>

      <div className="mt-8 space-y-5">
        <CategoryPills active={category} search={search} sort={sort} />
        <GalleryControls initialSearch={search ?? ""} sort={sort} />
      </div>

      {count === 0 ? (
        <EmptyState search={search} category={category} />
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <li key={t.slug}>
              <TemplateCard template={t} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
