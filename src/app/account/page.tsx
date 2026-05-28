import { withAuth } from "@workos-inc/authkit-nextjs";
import { signOutAction } from "@/lib/auth-actions";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  // Middleware already ensures we're signed in here, but ensureSignedIn
  // makes the type narrow and re-redirects if a stale token slips through.
  const { user, impersonator } = await withAuth({ ensureSignedIn: true });

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-ink-300">Account</span>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{fullName}</h1>
        <p className="text-ink-200">{user.email}</p>
      </header>

      {impersonator ? (
        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
          Signed in as this user by <strong>{impersonator.email}</strong>.
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-300">User ID</dt>
          <dd className="mt-1 font-mono text-ink-100 break-all">{user.id}</dd>
        </div>
        <div>
          <dt className="text-ink-300">Email verified</dt>
          <dd className="mt-1 text-ink-100">{user.emailVerified ? "Yes" : "No"}</dd>
        </div>
      </dl>

      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
        >
          Sign out
        </button>
      </form>
    </section>
  );
}
