import Link from "next/link";
import { getFeaturedTemplates } from "@/lib/data";
import { TemplateCard } from "@/components/templates/template-card";
import { Reveal } from "@/components/motion/reveal";

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
    <section className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal as="div" className="flex items-end justify-between gap-6" stagger>
          <div className="max-w-xl">
            <p
              data-reveal
              className="text-xs font-medium uppercase tracking-wider text-accent-500"
            >
              Featured
            </p>
            <h2
              data-reveal
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Start with one of these.
            </h2>
          </div>
          <Link
            href="/gallery"
            data-reveal
            className="hidden whitespace-nowrap rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 sm:inline-block"
          >
            See all templates →
          </Link>
        </Reveal>

        <Reveal
          as="ul"
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          stagger
        >
          {templates.map((t, i) => (
            <li key={t.slug} data-reveal>
              <TemplateCard template={t} priority={i === 0} locked={locked} />
            </li>
          ))}
        </Reveal>

        <Link
          href="/gallery"
          className="mt-8 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 sm:hidden"
        >
          See all templates →
        </Link>
      </div>
    </section>
  );
}
