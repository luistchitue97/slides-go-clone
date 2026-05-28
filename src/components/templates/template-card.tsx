import Link from "next/link";
import Image from "next/image";
import { CATEGORY_LABELS, type Template } from "@/types/template";

type Props = {
  template: Template;
  /** Optional priority hint for above-the-fold images. */
  priority?: boolean;
};

/**
 * Static card used on the landing page and gallery. Video preview wiring
 * (hover/tap autoplay, lazy loading, fallback chain) lands in Phase 4 — for
 * now the card always shows the static thumbnail.
 */
export function TemplateCard({ template, priority = false }: Props) {
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-soft transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      aria-label={`${template.title} — ${CATEGORY_LABELS[template.category]}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-800">
        <Image
          src={template.thumbnailUrl}
          alt=""
          role="presentation"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {template.isNew ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-900">
            New
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-300">
          {CATEGORY_LABELS[template.category]}
        </p>
        <h3 className="mt-1 text-base font-medium text-white">{template.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-200">{template.shortDescription}</p>
      </div>
    </Link>
  );
}
