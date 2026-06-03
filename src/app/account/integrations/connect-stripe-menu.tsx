import { startStripeConnect, attachExistingAccount } from "@/lib/integration-actions";

type OrgAccount = { id: string; displayName: string | null; externalAccountId: string };

const itemClass =
  "block w-full rounded-md px-3 py-2 text-left text-xs text-ink-200 transition hover:bg-white/5 hover:text-white light:text-ink-600 light:hover:bg-ink-900/5 light:hover:text-ink-900";

/**
 * Connect control for a report's Stripe row when the org already has connected
 * account(s): a dropdown to reuse one in a single click (no fresh OAuth), or
 * start a new authorization. Pure CSS via <details> — no client JS.
 */
export function ConnectStripeMenu({
  reportKey,
  accounts,
}: {
  reportKey: string;
  accounts: OrgAccount[];
}) {
  return (
    <details className="group relative shrink-0">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900 [&::-webkit-details-marker]:hidden">
        Connect
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-3 transition group-open:rotate-180" aria-hidden>
          <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z" />
        </svg>
      </summary>

      <div className="absolute right-0 top-full z-10 mt-1 w-60 rounded-xl border border-white/10 bg-ink-900/95 p-1 shadow-lift backdrop-blur light:border-ink-900/10 light:bg-white/95">
        <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-400 light:text-ink-500">
          Use a connected account
        </p>
        {accounts.map((a) => (
          <form key={a.id} action={attachExistingAccount}>
            <input type="hidden" name="reportKey" value={reportKey} />
            <input type="hidden" name="accountId" value={a.id} />
            <button type="submit" className={`${itemClass} truncate`}>
              {a.displayName || a.externalAccountId}
            </button>
          </form>
        ))}
        <div className="my-1 border-t border-white/10 light:border-ink-900/10" />
        <form action={startStripeConnect}>
          <input type="hidden" name="reportKey" value={reportKey} />
          <button type="submit" className={itemClass}>
            Connect a different account →
          </button>
        </form>
      </div>
    </details>
  );
}
