import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/data";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) return { title: "Template not found" };
  return {
    title: template.title,
    description: template.shortDescription,
  };
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = await getTemplate(slug);
  if (!template) notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-wider text-ink-300">{template.category}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{template.title}</h1>
      <p className="mt-3 text-ink-200">{template.longDescription}</p>
      <p className="mt-6 text-sm text-ink-300">
        Phase 0 placeholder — preview + launch button land in Phase 3.
      </p>
    </section>
  );
}
