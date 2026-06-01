import Link from "next/link";
import { CATEGORY_LABELS, type Template } from "@/types/template";
import { CardMedia } from "@/components/templates/card-media";

type Props = {
  template: Template;
  /** Optional priority hint for above-the-fold thumbnails. */
  priority?: boolean;
  /**
   * When true, render a small lock pill in the corner indicating the user
   * needs to purchase access. The card itself stays clickable so the user
   * can read the detail page and decide to buy.
   */
  locked?: boolean;
};

export function TemplateCard({ template, priority = false, locked = false }: Props) {
  return (
    <Link
      href={`/templates/${template.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-soft transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-ink-800 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      aria-label={`${template.title} — ${CATEGORY_LABELS[template.category]}${locked ? " (locked)" : ""}`}
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
        {locked ? (
          <span
            className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-ink-950/70 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur"
            aria-hidden
          >
            <LockIcon className="size-3" />
            Locked
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" strokeLinecap="round" />
    </svg>
  );
}
