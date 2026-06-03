import { withAuth } from "@workos-inc/authkit-nextjs";
import { CategoryPills } from "@/components/gallery/category-pills";
import { GalleryControls } from "@/components/gallery/gallery-controls";
import { EmptyState } from "@/components/gallery/empty-state";
import { TemplateCard } from "@/components/templates/template-card";
import { Reveal } from "@/components/motion/reveal";
import { getTemplates, getTemplateOrderUrl, parseCategory, parseSearch, parseSort } from "@/lib/data";
import { PeopleAllHandsCover } from "@/components/templates/people-all-hands-cover";
import { SeriesACover } from "@/components/templates/series-a-cover";
import { NorthStarCover } from "@/components/templates/north-star-cover";
import { QbrCover } from "@/components/templates/qbr-cover";
import { ComingSoonCover } from "@/components/templates/coming-soon-cover";

const COMING_SOON_SLUGS = new Set([
  "revenue-playbook",
  "growth-experiment-report",
  "fp-and-a-monthly-close",
  "ops-incident-review",
]);
import { getEntitlements } from "@/lib/entitlements";

export const metadata = {
  title: "Gallery",
  description: "Browse the full library of DeckForge business presentation templates.",
};

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
  already_purchased?: string;
}>;

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const category = parseCategory(raw.category);
  const search = parseSearch(raw.q);
  const sort = parseSort(raw.sort);

  const { user } = await withAuth();
  const [templates, entitlements] = await Promise.all([
    getTemplates({ category, search, sort }),
    getEntitlements(user?.id),
  ]);
  const count = templates.length;
  // Anonymous visitors see no lock pill — we don't want to pressure them
  // before they've signed up. Once signed in, the lock indicates they need
  // to buy. Clicking a card always sends them to the detail page; if they
  // aren't signed in, middleware redirects there.
  const locked = Boolean(user) && !entitlements.allAccess;

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
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl light:text-ink-900">
            Browse the library
          </h1>
          <p className="text-sm text-ink-300 light:text-ink-500" aria-live="polite">
            {count} template{count === 1 ? "" : "s"}
          </p>
        </div>
      </Reveal>

      {raw.already_purchased === "1" ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100"
        >
          You already have all-access — pick a template and open it.
        </p>
      ) : null}

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
              <TemplateCard
                template={t}
                priority={i < 3}
                locked={locked}
                launchUrl={getTemplateOrderUrl(t.slug)}
                customMedia={
                  COMING_SOON_SLUGS.has(t.slug)           ? <ComingSoonCover /> :
                  t.slug === "people-all-hands"            ? <PeopleAllHandsCover /> :
                  t.slug === "series-a-data-room"          ? <SeriesACover /> :
                  t.slug === "north-star-pitch"            ? <NorthStarCover /> :
                  t.slug === "quarterly-business-review"   ? <QbrCover /> :
                  undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
