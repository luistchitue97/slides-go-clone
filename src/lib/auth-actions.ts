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
  // Only allow same-site, absolute paths — refuse external URLs.
  if (!raw.startsWith("/") || raw.startsWith("//")) return undefined;
  return raw;
}
