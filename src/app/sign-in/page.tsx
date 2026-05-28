import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { startSignIn } from "@/lib/auth-actions";

export const metadata = { title: "Sign in" };

type SearchParams = Promise<{ error?: string; returnTo?: string }>;

export default async function SignInPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await withAuth();
  if (user) redirect("/gallery");

  const { error, returnTo } = await searchParams;

  return (
    <section className="mx-auto flex max-w-md flex-col items-start gap-5 px-4 py-24 sm:px-6">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-ink-200">
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
        {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
        <button
          type="submit"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90"
        >
          Continue with WorkOS
        </button>
      </form>

      <p className="text-sm text-ink-300">
        New here?{" "}
        <Link href="/sign-up" className="text-white underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </section>
  );
}
