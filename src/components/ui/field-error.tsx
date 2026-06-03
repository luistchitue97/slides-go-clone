export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-xs text-red-400">
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-3.5 shrink-0"
        aria-hidden
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5Zm0 6.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75Z" />
      </svg>
      {message}
    </p>
  );
}

/** Returns the Tailwind border classes for an input, switching to red when there is an error. */
export function inputBorder(hasError: boolean) {
  return hasError
    ? "border-red-500/50 focus:border-red-500/70"
    : "border-white/10 focus:border-white/25 light:border-ink-900/10 light:focus:border-ink-900/25";
}
