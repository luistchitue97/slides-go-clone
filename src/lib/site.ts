/**
 * Canonical site URL — used for metadataBase, sitemap, and robots.
 * Falls back to localhost in dev so OG previews still resolve.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const SITE_NAME = "DeckForge";

export const SITE_DESCRIPTION =
  "A curated library of premium business presentation templates — pitches, QBRs, sales playbooks, finance reports — ready to launch.";

/**
 * Customer-facing support inbox. Lands in the Resend dashboard via the
 * receiving MX on support.luistchitue.com. Used as the Reply-To on outbound
 * transactional email so replies don't bounce off the no-reply sender.
 */
export const SUPPORT_EMAIL = "help@support.luistchitue.com";
