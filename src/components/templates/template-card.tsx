import Link from "next/link";
import { CATEGORY_LABELS, type Template } from "@/types/template";
import { CardMedia } from "@/components/templates/card-media";

type Props = {
  template: Template;
  /** Optional priority hint for above-the-fold thumbnails. */
  priority?: boolean;
};

export function TemplateCard({ template, priority = false }: Props) {
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-soft transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      aria-label={`${template.title} — ${CATEGORY_LABELS[template.category]}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-800">
        <CardMedia
          thumbnailUrl={template.thumbnailUrl}
          previewVideoUrl={template.previewVideoUrl}
          alt=""
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
        {template.isNew ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-900">
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
