import Link from "next/link";
import { getFeaturedTemplates, getTemplateOrderUrl } from "@/lib/data";
import { TemplateCard } from "@/components/templates/template-card";
import { SeriesACover } from "@/components/templates/series-a-cover";
import { NorthStarCover } from "@/components/templates/north-star-cover";
import { QbrCover } from "@/components/templates/qbr-cover";
import { Reveal } from "@/components/motion/reveal";

function customMediaFor(slug: string) {
  if (slug === "series-a-data-room")        return <SeriesACover />;
  if (slug === "north-star-pitch")          return <NorthStarCover />;
  if (slug === "quarterly-business-review") return <QbrCover />;
  return undefined;
}

type Props = {
  signedIn: boolean;
  allAccess: boolean;
};

export async function FeaturedTemplates({ signedIn, allAccess }: Props) {
  const templates = await getFeaturedTemplates(3);
  // Show the lock indicator only to signed-in users who haven't purchased.
  // Anonymous visitors aren't being pressured to pay yet — they need to sign
  // up first, and the lock would feel like a bait-and-switch.
  const locked = signedIn && !allAccess;

  return (
    <section className="border-t border-white/5 light:border-ink-900/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal as="div" className="flex items-end justify-between gap-6" stagger>
          <div className="max-w-xl">
            <p
              data-reveal
              className="text-xs font-medium uppercase tracking-wider text-accent-500"
            >
              Reports
            </p>
            <h2
              data-reveal
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl light:text-ink-900"
            >
              Executive reports built for the work you do.
            </h2>
          </div>
          <Link
            href="/reports"
            data-reveal
            className="hidden whitespace-nowrap rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 sm:inline-block light:border-ink-900/15 light:text-ink-900 light:hover:bg-ink-900/5"
          >
            See all reports →
          </Link>
        </Reveal>

        <Reveal
          as="ul"
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger
        >
          {templates.map((t, i) => (
            <li key={t.slug} data-reveal>
              <TemplateCard
                template={t}
                priority={i === 0}
                locked={locked}
                launchUrl={getTemplateOrderUrl(t.slug)}
                customMedia={customMediaFor(t.slug)}
              />
            </li>
          ))}
        </Reveal>

        <Link
          href="/reports"
          className="mt-8 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 sm:hidden light:border-ink-900/15 light:text-ink-900 light:hover:bg-ink-900/5"
        >
          See all templates →
        </Link>
      </div>
    </section>
  );
}
