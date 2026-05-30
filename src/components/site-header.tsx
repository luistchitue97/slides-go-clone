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

        {/* Inline nav (≥ md). Below md the same links live in the dropdown. */}
        <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Primary">
          <NavLinks signedIn={Boolean(user)} variant="inline" />
        </nav>

        {/* Mobile menu — pure CSS via <details>; no client JS needed.
            Opens an absolutely-positioned panel below the header bar. */}
        <details className="relative md:hidden [&[open]_.menu-panel]:flex [&[open]_.menu-open-icon]:hidden [&[open]_.menu-close-icon]:block">
          <summary
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md text-white transition hover:bg-white/5 [&::-webkit-details-marker]:hidden"
            aria-label="Open menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="menu-open-icon size-5"
              aria-hidden
            >
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="menu-close-icon hidden size-5"
              aria-hidden
            >
              <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="menu-panel absolute right-0 top-full mt-2 hidden w-56 flex-col gap-1 rounded-xl border border-white/10 bg-ink-900/95 p-2 text-sm shadow-lift backdrop-blur">
            <NavLinks signedIn={Boolean(user)} variant="dropdown" />
          </div>
        </details>
      </div>
    </header>
  );
}

function NavLinks({
  signedIn,
  variant,
}: {
  signedIn: boolean;
  variant: "inline" | "dropdown";
}) {
  const linkClass =
    variant === "inline"
      ? "rounded-md px-3 py-2 text-ink-200 transition hover:bg-white/5 hover:text-white"
      : "block rounded-md px-3 py-2 text-ink-100 transition hover:bg-white/5 hover:text-white";
  const ctaClass =
    variant === "inline"
      ? "rounded-md bg-white px-3 py-2 font-medium text-ink-900 transition hover:bg-white/90"
      : "block rounded-md bg-white px-3 py-2 text-center font-medium text-ink-900 transition hover:bg-white/90";
  // Dropdown buttons need to span the full panel width so they look like the
  // other links. Inline buttons keep their natural width.
  const buttonClass =
    variant === "inline"
      ? "rounded-md px-3 py-2 text-ink-200 transition hover:bg-white/5 hover:text-white"
      : "block w-full rounded-md px-3 py-2 text-left text-ink-100 transition hover:bg-white/5 hover:text-white";

  return (
    <>
      <Link href="/gallery" className={linkClass}>
        Gallery
      </Link>
      <Link href="/pricing" className={linkClass}>
        Pricing
      </Link>

      {signedIn ? (
        <>
          <Link href="/account" className={linkClass}>
            Account
          </Link>
          <form action={signOutAction}>
            <button type="submit" className={buttonClass}>
              Sign out
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/sign-in" className={linkClass}>
            Sign in
          </Link>
          <Link href="/sign-up" className={ctaClass}>
            Get started
          </Link>
        </>
      )}
    </>
  );
}
