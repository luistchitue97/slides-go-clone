export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/[0.08] light:bg-ink-900/[0.07] ${className ?? ""}`}
    />
  );
}
