import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { desc, eq } from "drizzle-orm";
import { signOutAction } from "@/lib/auth-actions";
import { openBillingPortal } from "@/lib/billing-actions";
import { db } from "@/db";
import { purchases } from "@/db/schema";
import { getEntitlements } from "@/lib/entitlements";

export const metadata: Metadata = { title: "Settings" };

type SearchParams = Promise<{ purchase?: string }>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { user, impersonator } = await withAuth({ ensureSignedIn: true });
  const { purchase } = await searchParams;

  const [entitlements, history] = await Promise.all([
    getEntitlements(user.id),
    getPurchaseHistorySafe(user.id),
  ]);

  const showSuccess = purchase === "success";

  return (
    <div className="flex flex-col gap-6">
      {showSuccess ? <PurchaseSuccessBanner allAccess={entitlements.allAccess} /> : null}

      {impersonator ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          Signed in as this user by <strong>{impersonator.email}</strong>.
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 text-sm shadow-lift sm:grid-cols-2 light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <div>
          <dt className="text-ink-300 light:text-ink-500">User ID</dt>
          <dd className="mt-1 break-all font-mono text-ink-100 light:text-ink-800">{user.id}</dd>
        </div>
        <div>
          <dt className="text-ink-300 light:text-ink-500">Email verified</dt>
          <dd className="mt-1 text-ink-100 light:text-ink-800">{user.emailVerified ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-ink-300 light:text-ink-500">Plan</dt>
          <dd className="mt-1 text-ink-100 light:text-ink-800">
            {entitlements.allAccess ? "All-access · lifetime" : "Free"}
          </dd>
        </div>
      </dl>

      <PurchaseHistory rows={history} />

      <div className="flex flex-wrap items-center gap-3">
        {history.length > 0 ? (
          <form action={openBillingPortal}>
            <button
              type="submit"
              className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 light:border-ink-900/15 light:text-ink-900 light:hover:bg-ink-900/5"
            >
              Manage billing
            </button>
          </form>
        ) : null}
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 light:border-ink-900/15 light:text-ink-900 light:hover:bg-ink-900/5"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

function PurchaseSuccessBanner({ allAccess }: { allAccess: boolean }) {
  if (allAccess) {
    return (
      <p
        role="status"
        className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100"
      >
        You&apos;re in. Every template is unlocked — head to reports to open one.
      </p>
    );
  }
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200"
    >
      Your purchase is being processed. Refresh in a few seconds — if it stays this way after a
      minute, drop us a note.
    </p>
  );
}

function PurchaseHistory({
  rows,
}: {
  rows: Array<{ id: string; kind: string; amountCents: number; currency: string; purchasedAt: Date }>;
}) {
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 text-sm text-ink-300 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white light:text-ink-500">
        <h2 className="text-base font-medium text-white light:text-ink-900">Purchases</h2>
        <p className="mt-1">No purchases yet.</p>
      </section>
    );
  }
  return (
    <section className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
      <h2 className="text-base font-medium text-white light:text-ink-900">Purchases</h2>
      <ul className="mt-3 divide-y divide-white/5 text-sm light:divide-ink-900/10">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-ink-100 light:text-ink-800">{labelFor(row.kind)}</p>
              <p className="text-xs text-ink-300 light:text-ink-500">
                {row.purchasedAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <p className="font-mono text-ink-100 light:text-ink-800">
              {formatMoney(row.amountCents, row.currency)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function labelFor(kind: string): string {
  if (kind === "all_access") return "DeckForge All-Access — lifetime";
  if (kind.startsWith("template:")) return `Template — ${kind.slice("template:".length)}`;
  return kind;
}

function formatMoney(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
  }
}

async function getPurchaseHistorySafe(userId: string) {
  try {
    return await db
      .select({
        id: purchases.id,
        kind: purchases.kind,
        amountCents: purchases.amountCents,
        currency: purchases.currency,
        purchasedAt: purchases.purchasedAt,
      })
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.purchasedAt));
  } catch (err) {
    console.error("[account/settings] failed to load purchase history:", err);
    return [];
  }
}
