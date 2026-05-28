import { getTemplates } from "@/lib/data";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const templates = await getTemplates();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-white">Gallery</h1>
      <p className="mt-2 text-ink-200">
        Phase 0 placeholder — full filter/search/sort lands in Phase 3.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <li
            key={t.slug}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-ink-300">{t.category}</p>
            <p className="mt-1 font-medium text-white">{t.title}</p>
            <p className="mt-1 text-sm text-ink-200">{t.shortDescription}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
