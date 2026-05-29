import type { Template } from "@/types/template";

/** Accept only absolute http(s) URLs. Anything else can't be opened safely. */
export function isExternalHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * A template is "openable" only when it's not disabled and its launchUrl is a
 * real http(s) URL. The detail page uses this to swap the launch button for a
 * "temporarily unavailable" state instead of sending users to a broken target.
 */
export function isLaunchable(template: Template): boolean {
  if (template.disabled) return false;
  return isExternalHttpUrl(template.launchUrl);
}

/**
 * One of three states a launch CTA can be in. Centralized so the detail
 * page (and any future surface) reads from one source.
 *
 *   - "open"        → user is entitled; render <a href={launchUrl}>
 *   - "buy"         → template is healthy but user hasn't paid; render Buy CTA
 *   - "unavailable" → template itself is broken/disabled; render disabled state
 *
 * Callers must NOT render launchUrl unless the returned state is "open" —
 * leaking the URL to unentitled users defeats the paywall.
 */
export type LaunchState = "open" | "buy" | "unavailable";

export function getLaunchState(template: Template, allAccess: boolean): LaunchState {
  if (!isLaunchable(template)) return "unavailable";
  return allAccess ? "open" : "buy";
}
