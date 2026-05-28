export const CATEGORIES = [
  "marketing",
  "sales",
  "management",
  "investing",
  "finance",
  "ops",
  "hr",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  marketing: "Marketing",
  sales: "Sales",
  management: "Management",
  investing: "Investing",
  finance: "Finance",
  ops: "Operations",
  hr: "People & HR",
};

export type Template = {
  slug: string;
  title: string;
  category: Category;
  tags: string[];
  shortDescription: string;
  longDescription: string;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  launchUrl: string;
  aspectRatio: "16:9";
  isNew?: boolean;
  disabled?: boolean;
  requiredPlan?: "free" | "pro";
  publishedAt: string;
};
