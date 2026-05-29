"use server";

import { getSignInUrl, getSignUpUrl, signOut } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export async function signOutAction() {
  await signOut({ returnTo: "/" });
}

export async function startSignIn(formData: FormData) {
  const returnTo = readReturnTo(formData);
  const url = await getSignInUrl({ returnTo });
  redirect(url);
}

export async function startSignUp(formData: FormData) {
  const returnTo = readReturnTo(formData);
  const url = await getSignUpUrl({ returnTo });
  redirect(url);
}

function readReturnTo(formData: FormData): string | undefined {
  const raw = formData.get("returnTo");
  if (typeof raw !== "string" || raw.length === 0) return undefined;

  // Same-site absolute paths are fine.
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  // Cross-subdomain absolute URLs on luistchitue.com: round-trip via /sign-in
  // so the post-auth cross-domain redirect lives in one place (the sign-in
  // page's safeReturnTo logic), not in the lib's NextResponse.redirect call.
  try {
    const dest = new URL(raw);
    if (dest.hostname === "luistchitue.com" || dest.hostname.endsWith(".luistchitue.com")) {
      return `/sign-in?returnTo=${encodeURIComponent(dest.toString())}`;
    }
  } catch {
    // malformed URL
  }
  return undefined;
}
