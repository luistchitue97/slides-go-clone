import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Only public routes go in the sitemap. /gallery, /account, and
 * /templates/[slug] are auth-gated and should not be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
