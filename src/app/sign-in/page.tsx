import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { startSignIn } from "@/lib/auth-actions";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<{ error?: string; returnTo?: string }>;

// Allow only same-org redirects post-sign-in. Without this, a crafted
// ?returnTo=https://attacker.com would let anyone phish freshly-signed-in users.
function safeReturnTo(returnTo?: string): string | null {
  if (!returnTo) return null;
  try {
    const dest = new URL(returnTo);
    if (dest.hostname === "luistchitue.com" || dest.hostname.endsWith(".luistchitue.com")) {
      return dest.toString();
    }
  } catch {
    if (returnTo.startsWith("/")) return returnTo;
  }
  return null;
}

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { error, returnTo } = await searchParams;
  const safe = safeReturnTo(returnTo);

  const { user } = await withAuth();
  if (user) redirect(safe ?? "/gallery");

  return (
    <section className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-4 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-start gap-5">
      <span className="text-ink-200 rounded-full border border-white/10 px-3 py-1 text-xs tracking-wider uppercase">
        Sign in
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome back.</h1>
      <p className="text-ink-200">
        Sign in to browse the gallery and open templates. We use WorkOS for secure, hosted
        authentication.
      </p>

      {error === "callback" ? (
        <p
          role="alert"
          className="w-full rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200"
        >
          We couldn&apos;t complete your sign-in. Please try again — if it keeps happening, refresh
          and start over.
        </p>
      ) : null}

      <form action={startSignIn}>
        {safe ? <input type="hidden" name="returnTo" value={safe} /> : null}
        <button
          type="submit"
          className="text-ink-900 rounded-lg bg-white px-4 py-2 text-sm font-medium transition hover:bg-white/90"
        >
          Continue with WorkOS
        </button>
      </form>

      <p className="text-ink-300 text-sm">
        New here?{" "}
        <Link href="/sign-up" className="text-white underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
      </div>
    </section>
  );
}
