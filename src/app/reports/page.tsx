import { withAuth } from "@workos-inc/authkit-nextjs";
import { CategoryPills } from "@/components/reports/category-pills";
import { ReportControls } from "@/components/reports/report-controls";
import { EmptyState } from "@/components/reports/empty-state";
import { TemplateCard } from "@/components/templates/template-card";
import { Reveal } from "@/components/motion/reveal";
import { getTemplates, getTemplateOrderUrl, parseCategory, parseSearch, parseSort } from "@/lib/data";
import { PeopleAllHandsCover } from "@/components/templates/people-all-hands-cover";
import { SeriesACover } from "@/components/templates/series-a-cover";
import { NorthStarCover } from "@/components/templates/north-star-cover";
import { QbrCover } from "@/components/templates/qbr-cover";
import { ComingSoonCover } from "@/components/templates/coming-soon-cover";
import { getEntitlements } from "@/lib/entitlements";

const COMING_SOON_SLUGS = new Set([
  "revenue-playbook",
  "growth-experiment-report",
  "fp-and-a-monthly-close",
  "ops-incident-review",
]);

export const metadata = {
  title: "Reports",
  description: "Browse the full library of DeckForge executive report templates.",
};

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
  already_purchased?: string;
}>;

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
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
  const locked = Boolean(user) && !entitlements.allAccess;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <Reveal as="header" className="flex flex-col gap-2" stagger immediate>
        <p
          data-reveal
          className="text-xs font-medium uppercase tracking-wider text-accent-500"
        >
          Reports
        </p>
        <div data-reveal className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl light:text-ink-900">
            Browse reports
          </h1>
          <p className="text-sm text-ink-300 light:text-ink-500" aria-live="polite">
            {count} report{count === 1 ? "" : "s"}
          </p>
        </div>
      </Reveal>

      {raw.already_purchased === "1" ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100 light:border-emerald-600/30 light:bg-emerald-50 light:text-emerald-800"
        >
          Your subscription is active — pick a report and open it.
        </p>
      ) : null}

      <div className="mt-8 space-y-5">
        <CategoryPills active={category} search={search} sort={sort} />
        <ReportControls initialSearch={search ?? ""} sort={sort} />
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
