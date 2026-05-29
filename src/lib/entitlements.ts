import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { purchases } from "@/db/schema";

export type Entitlements = {
  allAccess: boolean;
};

export const NO_ENTITLEMENTS: Entitlements = { allAccess: false };

/**
 * Read entitlements for a WorkOS user. Memoized per-request via React.cache
 * so a single render can call this from the header, the page, and a CTA
 * component without hitting the DB three times.
 *
 * Returns NO_ENTITLEMENTS for null/undefined users — call sites can pass
 * `user?.id` directly without a null-check guard.
 */
export const getEntitlements = cache(
  async (userId: string | null | undefined): Promise<Entitlements> => {
    if (!userId) return NO_ENTITLEMENTS;

    const rows = await db
      .select({ kind: purchases.kind })
      .from(purchases)
      .where(eq(purchases.userId, userId));

    return {
      allAccess: rows.some((r) => r.kind === "all_access"),
    };
  },
);
