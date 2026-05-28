import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate } from "@/lib/data";
import { isLaunchable } from "@/lib/url";
import { CATEGORY_LABELS } from "@/types/template";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) return { title: "Template not found" };
  return {
    title: template.title,
    description: template.shortDescription,
    openGraph: {
      title: template.title,
      description: template.shortDescription,
      images: [{ url: template.thumbnailUrl }],
      type: "article",
    },
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  const launchable = isLaunchable(template);

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <Link
        href="/gallery"
        className="inline-flex items-center gap-1 text-sm text-ink-300 transition hover:text-white"
      >
        <span aria-hidden>←</span> Back to gallery
      </Link>

      <header className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-ink-200">
            {CATEGORY_LABELS[template.category]}
          </span>
          {template.isNew ? (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-900">
              New
            </span>
          ) : null}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {template.title}
        </h1>
        <p className="max-w-2xl text-lg text-ink-200">{template.shortDescription}</p>
      </header>

      <div className="mt-10 relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-ink-800 shadow-lift">
        <Image
          src={template.thumbnailUrl}
          alt={`${template.title} preview`}
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <div className="text-ink-100">
          <h2 className="text-xl font-medium text-white">About this template</h2>
          <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-ink-200">
            {template.longDescription}
          </p>

          {template.tags.length ? (
            <div className="mt-8">
              <h3 className="text-sm font-medium uppercase tracking-wider text-ink-300">Tags</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-xs text-ink-200"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-300">Launch</p>
          {launchable ? (
            <>
              <a
                href={template.launchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-ink-900 shadow-lift transition hover:bg-white/90"
              >
                Open template
                <span aria-hidden>↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <p className="mt-3 text-xs text-ink-300">
                Opens the deployed template in a new tab.
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled
                aria-disabled
                className="mt-3 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink-300"
              >
                Temporarily unavailable
              </button>
              <p className="mt-3 text-xs text-ink-300">
                This template is offline right now. Check back soon.
              </p>
            </>
          )}

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-300">Published</dt>
              <dd className="text-ink-100">
                {new Date(template.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-300">Aspect</dt>
              <dd className="text-ink-100">{template.aspectRatio}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </article>
  );
}
