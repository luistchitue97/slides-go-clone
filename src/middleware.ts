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
  // Run on every path except Next internals, asset files, and SEO files.
  // /public assets (templates/*.svg etc.) and robots/sitemap are matched
  // by extension here so they never hit the auth gate.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|xml|txt)).*)",
  ],
};
