import Link from "next/link";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { desc, eq } from "drizzle-orm";
import { signOutAction } from "@/lib/auth-actions";
import { openBillingPortal } from "@/lib/billing-actions";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getEntitlements } from "@/lib/entitlements";

type SearchParams = Promise<{ purchase?: string }>;

// Settings is the default account view — it renders directly at /account so
// clicking "Account" lands here with the Settings tab active (no redirect hop).
export default async function AccountSettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const { user, impersonator } = await withAuth({ ensureSignedIn: true });
  const { purchase } = await searchParams;

  const [entitlements, subscription] = await Promise.all([
    getEntitlements(user.id),
    getSubscriptionSafe(user.id),
  ]);

  const showSuccess = purchase === "success";

  return (
    <div className="flex flex-col gap-6">
      {showSuccess ? <PurchaseSuccessBanner allAccess={entitlements.allAccess} /> : null}

      {impersonator ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200 light:border-amber-600/30 light:bg-amber-50 light:text-amber-800">
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
            {entitlements.allAccess ? "Subscribed · active" : "Free"}
          </dd>
        </div>
      </dl>

      <SubscriptionStatus subscription={subscription} />

      <div className="flex flex-wrap items-center gap-3">
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
        className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100 light:border-emerald-600/30 light:bg-emerald-50 light:text-emerald-800"
      >
        You&apos;re subscribed. Every report is unlocked — head to reports to open one.
      </p>
    );
  }
  return (
    <p
      role="status"
      className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200 light:border-amber-600/30 light:bg-amber-50 light:text-amber-800"
    >
      Your subscription is being activated. Refresh in a few seconds — if it stays this way after a
      minute, drop us a note.
    </p>
  );
}

type SubscriptionRow = {
  status: string;
  currentPeriodEnd: Date | null;
};

// Maps a Stripe subscription status to a label, badge colour, and whether it
// currently grants access.
function statusMeta(status: string): { label: string; badge: string; active: boolean } {
  switch (status) {
    case "active":
      return { label: "Active", badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", active: true };
    case "trialing":
      return { label: "Trial", badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", active: true };
    case "past_due":
      return { label: "Past due", badge: "border-amber-400/30 bg-amber-400/10 text-amber-300", active: true };
    case "canceled":
      return { label: "Canceled", badge: "border-white/15 bg-white/[0.04] text-ink-300 light:border-ink-900/15 light:bg-ink-100 light:text-ink-500", active: false };
    case "unpaid":
      return { label: "Unpaid", badge: "border-red-400/30 bg-red-400/10 text-red-300", active: false };
    default:
      return { label: status.replace(/_/g, " "), badge: "border-white/15 bg-white/[0.04] text-ink-300 light:border-ink-900/15 light:bg-ink-100 light:text-ink-500", active: false };
  }
}

function SubscriptionStatus({ subscription }: { subscription: SubscriptionRow | null }) {
  if (!subscription) {
    return (
      <section className="rounded-xl border border-dashed border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 text-sm shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
        <h2 className="text-base font-medium text-white light:text-ink-900">Subscription</h2>
        <p className="mt-1 text-ink-300 light:text-ink-500">
          You don&apos;t have an active subscription.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90 light:bg-ink-900 light:text-white light:hover:bg-ink-800"
        >
          View plan →
        </Link>
      </section>
    );
  }

  const meta = statusMeta(subscription.status);
  const dateLabel = subscription.status === "canceled" ? "Access ends" : "Renews";
  const dateStr = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <section className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/25 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-medium text-white light:text-ink-900">Subscription</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.badge}`}>
          {meta.active ? <span className="size-1.5 rounded-full bg-current" /> : null}
          {meta.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-300 light:text-ink-500">Plan</dt>
          <dd className="mt-1 text-ink-100 light:text-ink-800">DeckForge — monthly</dd>
        </div>
        {dateStr ? (
          <div>
            <dt className="text-ink-300 light:text-ink-500">{dateLabel}</dt>
            <dd className="mt-1 text-ink-100 light:text-ink-800">{dateStr}</dd>
          </div>
        ) : null}
      </dl>

      <form action={openBillingPortal} className="mt-5">
        <button
          type="submit"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5 light:border-ink-900/15 light:text-ink-900 light:hover:bg-ink-900/5"
        >
          Manage subscription
        </button>
      </form>
    </section>
  );
}

async function getSubscriptionSafe(userId: string): Promise<SubscriptionRow | null> {
  try {
    const rows = await db
      .select({
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("[account] failed to load subscription:", err);
    return null;
  }
}
