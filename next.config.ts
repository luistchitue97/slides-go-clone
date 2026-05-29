import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Pragmatic CSP for a Next.js + WorkOS AuthKit + Stripe (Hosted Checkout) app.
 *
 * - 'unsafe-inline' is required for Next's hydration bootstrap script and for
 *   styled spans Next inlines for streaming. A nonce-based approach is the
 *   long-term improvement but needs middleware integration.
 * - connect-src includes api.workos.com so AuthKit-related client calls
 *   (if any are added later) can reach WorkOS without a CSP violation.
 * - form-action allows api.workos.com so the sign-in / sign-up server
 *   actions, which redirect to the WorkOS hosted URL, are permitted.
 * - frame-ancestors 'none' prevents click-jacking. Equivalent to X-Frame-Options: DENY.
 *
 * Stripe — Hosted Checkout is a top-level redirect, not an embed or fetch,
 * so no CSP allowance is needed today. If you ever embed Stripe.js
 * (Elements, payment-method update, etc.) add the following:
 *   script-src  + https://js.stripe.com
 *   frame-src   + https://js.stripe.com https://hooks.stripe.com
 *   connect-src + https://api.stripe.com
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (isProd ? "" : " 'unsafe-eval'"),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.workos.com",
  "form-action 'self' https://api.workos.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  // Prod-only: in dev we serve http://local.luistchitue.com:3000 for
  // subdomain-cookie testing, and this directive would force subresources
  // to https and break asset loading.
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.deckforge.app" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
