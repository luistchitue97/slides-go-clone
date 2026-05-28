import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { startSignUp } from "@/lib/auth-actions";

export const metadata = { title: "Sign up" };

type SearchParams = Promise<{ returnTo?: string }>;

export default async function SignUpPage({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await withAuth();
  if (user) redirect("/gallery");

  const { returnTo } = await searchParams;

  return (
    <section className="mx-auto flex max-w-md flex-col items-start gap-5 px-4 py-24 sm:px-6">
      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wider text-ink-200">
        Get started
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Create your DeckForge account.
      </h1>
      <p className="text-ink-200">
        Free to browse the gallery. We use WorkOS for secure, hosted authentication — no password
        forms to manage.
      </p>

      <form action={startSignUp}>
        {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
        <button
          type="submit"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-white/90"
        >
          Continue with WorkOS
        </button>
      </form>

      <p className="text-sm text-ink-300">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-white underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
