import Link from "next/link";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { signOutAction } from "@/lib/auth-actions";

export async function SiteHeader() {
  const { user } = await withAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-white"
          aria-label="DeckForge home"
        >
          <span
            aria-hidden
            className="inline-block size-6 rounded-md bg-gradient-to-br from-brand-400 to-accent-500"
          />
          DeckForge
        </Link>
        <nav className="flex items-center gap-1 text-sm" aria-label="Primary">
          <Link
            href="/gallery"
            className="rounded-md px-3 py-2 text-ink-200 transition hover:bg-white/5 hover:text-white"
          >
            Gallery
          </Link>

          {user ? (
            <>
              <Link
                href="/account"
                className="rounded-md px-3 py-2 text-ink-200 transition hover:bg-white/5 hover:text-white"
              >
                Account
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-ink-200 transition hover:bg-white/5 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-2 text-ink-200 transition hover:bg-white/5 hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-white px-3 py-2 font-medium text-ink-900 transition hover:bg-white/90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
