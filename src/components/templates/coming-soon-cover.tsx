/**
 * Placeholder cover for templates not yet available.
 * Rich gradient background with a centred "Coming soon" label.
 */
export function ComingSoonCover() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-900 via-ink-900 to-ink-950">
      {/* Soft ambient glow behind the label */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-2xl"
      />
      <span className="relative text-base font-semibold uppercase tracking-[0.2em] text-white/80">
        Coming soon
      </span>
    </div>
  );
}
