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
