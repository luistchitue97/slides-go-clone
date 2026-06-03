import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export type Entitlements = {
  allAccess: boolean;
};

export const NO_ENTITLEMENTS: Entitlements = { allAccess: false };

// Statuses that keep a subscriber's access on. `past_due` is included as a
// grace period — Stripe is still retrying the payment; we revoke only once
// it fully lapses (canceled/unpaid) or the subscription is deleted.
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * Read entitlements for a WorkOS user. Memoized per-request via React.cache
 * so a single render can call this from the header, the page, and a CTA
 * component without hitting the DB three times.
 *
 * Returns NO_ENTITLEMENTS for null/undefined users — call sites can pass
 * `user?.id` directly without a null-check guard.
 *
 * On DB failure (misconfigured DATABASE_URL, transient connection error)
 * also returns NO_ENTITLEMENTS rather than throwing. This degrades the
 * paywall to "buy" rather than 500ing the page; the webhook remains the
 * only source of truth for *granting* access, so this never falsely
 * elevates a user. The error is logged for ops.
 */
export const getEntitlements = cache(
  async (userId: string | null | undefined): Promise<Entitlements> => {
    if (!userId) return NO_ENTITLEMENTS;

    try {
      const rows = await db
        .select({ status: subscriptions.status })
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      return {
        allAccess: rows.some((r) => ACTIVE_STATUSES.has(r.status)),
      };
    } catch (err) {
      console.error("[entitlements] DB read failed; defaulting to no access:", err);
      return NO_ENTITLEMENTS;
    }
  },
);
