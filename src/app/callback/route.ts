import { handleAuth } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

export const GET = handleAuth({
  // Fallback when the OAuth state has no returnPathname (rare —
  // direct hits on /callback). Middleware sets the pathname for normal flows.
  returnPathname: "/gallery",
  onError: ({ error, request }) => {
    console.error("[auth/callback] error:", error);
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("error", "callback");
    return NextResponse.redirect(url);
  },
});
