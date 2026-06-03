/**
 * Inlined blocking script — runs before any paint so the correct theme class
 * is on <html> before React hydrates. Prevents the dark→light flash on page
 * load for users who have picked light mode.
 *
 * Must render as a raw <script> tag with no deferred loading.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('df-theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
