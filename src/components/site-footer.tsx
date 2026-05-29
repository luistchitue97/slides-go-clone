import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10 text-sm text-ink-300">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
        <p>© {new Date().getFullYear()} DeckForge</p>
        <nav className="flex items-center gap-4" aria-label="Footer">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/gallery" className="hover:text-white">
            Gallery
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/account" className="hover:text-white">
            Account
          </Link>
        </nav>
      </div>
    </footer>
  );
}
