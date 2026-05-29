import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

// Public paths — everything else is protected by AuthKit.
// The middleware redirects unauthenticated requests to the WorkOS hosted
// sign-in URL, encoding the original pathname in the OAuth state so the
// callback handler can return the user to where they were headed.
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/", "/sign-in", "/sign-up"],
  },
});

export const config = {
  // Run on every path except Next internals, asset files, SEO files, and
  // /api/stripe/* (webhooks must reach their handler with the raw body and
  // their own signature verification — no session refresh in the middle).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/stripe|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|xml|txt)).*)",
  ],
};
