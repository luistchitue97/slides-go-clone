import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

// Derive the post-auth redirect base from the configured redirect URI.
// Without this, handleAuth uses request.nextUrl, which in some dev setups
// (Next's --experimental-https, Docker) reports a host that doesn't match
// the one the browser actually hit, sending the user to the wrong origin.
const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI;
const baseURL = redirectUri ? new URL(redirectUri).origin : undefined;

export const GET = handleAuth({
  // Fallback when the OAuth state has no returnPathname (rare —
  // direct hits on /callback). Middleware sets the pathname for normal flows.
  returnPathname: "/gallery",
  baseURL,
  onError: ({ error, request }) => {
    console.error("[auth/callback] error:", error);
    const url = new URL("/sign-in", baseURL ?? request.url);
    url.searchParams.set("error", "callback");
    return NextResponse.redirect(url);
  },
});
