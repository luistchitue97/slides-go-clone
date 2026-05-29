# DeckForge

A polished, animated **Next.js + Tailwind + GSAP + WorkOS** web app that showcases a curated library of business presentation templates. Each template is a separate, independently deployed app referenced by URL — this app discovers, previews, gates, and links out to them.

Built in phases against [`slidesgo-clone-spec.md`](./slidesgo-clone-spec.md).

## What's in the box

- **Landing page** with hero, value props, featured templates, and CTA. Tasteful GSAP entrance + scroll-trigger reveals, gated on `prefers-reduced-motion`.
- **WorkOS AuthKit** sign-in / sign-up / sign-out via the hosted flow. Middleware-protected gallery, account, and template detail routes. Redirect-after-login round-trips through the sealed OAuth state.
- **Gallery** with URL-driven category filter, search (debounced), and sort. Skeleton loader, empty state with reset, and aria-live count.
- **Template detail** with OG metadata, "Open template" launch button (`target="_blank"`, `rel="noopener noreferrer"`), dead-URL handling (`isLaunchable()` swaps to "Temporarily unavailable"), and a slug-specific not-found page.
- **Card media** with the full §9 fallback chain: lazy-loaded video on hover/focus/tap (desktop or touch) → static thumbnail → branded SVG placeholder. Skipped entirely on reduced-motion / data-saver.
- **Hardening**: skip-to-content link, semantic HTML, AA contrast, focus-visible everywhere, sitemap, robots, CSP + security headers, branded 404/500, env-driven canonical URLs.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`
- **GSAP 3** via `@gsap/react` (`useGSAP` for auto-cleanup) + `ScrollTrigger`
- **WorkOS AuthKit** via `@workos-inc/authkit-nextjs`
- `pnpm` (pinned in `packageManager`), Node 20 LTS (pinned in `.nvmrc`)

## Local setup

```bash
nvm use                       # picks up Node 20 from .nvmrc
pnpm install
cp .env.example .env.local    # fill in WorkOS values from the dashboard
pnpm dev
```

App runs on http://localhost:3000.

## Scripts

| Script           | What it does                                                      |
| ---------------- | ----------------------------------------------------------------- |
| `pnpm dev`       | Dev server                                                        |
| `pnpm build`     | Production build                                                  |
| `pnpm start`     | Serve the production build                                        |
| `pnpm lint`      | ESLint (`next/core-web-vitals` + `next/typescript`)               |
| `pnpm format`    | Prettier write                                                    |
| `pnpm smoke:data`| Data-layer smoke (filter/search/sort + URL helpers, no server)    |
| `pnpm smoke:auth`| Auth-gate smoke (asserts redirect contract — needs a live server) |

## Environment variables

See [`.env.example`](./.env.example). All values required for a working build except `NEXT_PUBLIC_SITE_URL`, which has a localhost default.

| Variable                          | Notes                                                        |
| --------------------------------- | ------------------------------------------------------------ |
| `WORKOS_API_KEY`                  | From the WorkOS dashboard                                    |
| `WORKOS_CLIENT_ID`                | From the WorkOS dashboard                                    |
| `WORKOS_COOKIE_PASSWORD`          | 32+ char random string. `openssl rand -base64 32`            |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Must match the redirect registered in WorkOS for this env    |
| `NEXT_PUBLIC_SITE_URL`            | Canonical site URL — used by metadataBase, sitemap, robots   |

> AuthKit reads the redirect URI from `NEXT_PUBLIC_WORKOS_REDIRECT_URI` (not the unprefixed name). Don't trust generic WorkOS docs on this one — the `@workos-inc/authkit-nextjs` package uses the prefixed env var even though the value is consumed server-side.

## Project structure

```
src/
  app/
    layout.tsx                       # Root layout, fonts, skip-link, header/footer
    page.tsx                         # Landing (auth-aware CTAs)
    sign-in/, sign-up/               # Hosted-flow handoff via server actions
    callback/route.ts                # WorkOS callback (friendly retry on error)
    gallery/                         # Browse — filter/search/sort + skeleton
    templates/[slug]/                # Detail + launch + slug-specific not-found
    account/                         # Profile + sign-out
    not-found.tsx, error.tsx,        # Branded boundaries
      global-error.tsx
    robots.ts, sitemap.ts            # SEO
    globals.css                      # Tailwind + design tokens
  components/
    site-header.tsx, site-footer.tsx
    landing/                         # Hero, value props, featured, CTA
    gallery/                         # Pills, controls, empty state
    templates/                       # Card, CardMedia (hover-play), ImageWithFallback
    motion/reveal.tsx                # GSAP-driven Reveal with matchMedia gating
  data/templates.ts                  # Seed data (swap to CMS/DB later)
  lib/
    data.ts                          # getTemplates / parseCategory / parseSearch / parseSort
    url.ts                           # isExternalHttpUrl / isLaunchable
    site.ts                          # SITE_URL / SITE_NAME / SITE_DESCRIPTION
    auth-actions.ts                  # signOut / startSignIn / startSignUp server actions
  middleware.ts                      # authkitMiddleware — protected route gate
  types/template.ts                  # Template + Category types

public/templates/                    # Placeholder thumbnails + branded fallback
scripts/
  smoke-data.mts                     # Filter/search/sort/URL helpers test
  smoke-auth.mts                     # Auth-gate redirect contract test
```

## Smoke tests

```bash
# Data layer (no server needed)
npx tsx scripts/smoke-data.mts

# Auth gate (needs a running dev or production server)
pnpm dev &
SMOKE_URL=http://localhost:3000 npx tsx scripts/smoke-auth.mts
```

The auth-gate smoke asserts:

- public routes (`/`, `/sign-in`, `/sign-up`, sitemap, robots) → **200**
- protected routes (`/gallery`, `/account`, `/templates/<slug>`) → **307** to `api.workos.com`
- query params on protected routes are preserved through the WorkOS redirect
- `/callback` with no code → **307** to `/sign-in?error=callback` (friendly retry)

## Security

- CSP + `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` configured in [`next.config.ts`](./next.config.ts). `Strict-Transport-Security` is added in production.
- All external links use `rel="noopener noreferrer"` and `target="_blank"`.
- Launch URLs are validated by `isLaunchable()` — non-http(s) or `disabled: true` templates show "Temporarily unavailable" instead of opening.
- Search-param values are validated by `parseCategory` / `parseSort` / `parseSearch`. Junk falls back to safe defaults.
- The `returnTo` form input is sanitized in `startSignIn` / `startSignUp` to refuse non-same-origin paths (open-redirect prevention).
- Cookies are `httpOnly`, `sameSite=lax`, `secure` in production — AuthKit defaults, not overridden.

## Deployment

Target: **Vercel**.

1. Push to GitHub.
2. Import the repo in Vercel.
3. Set the env vars from `.env.example` in **Project Settings → Environment Variables** for each environment (Production / Preview / Development).
4. In the **WorkOS dashboard**, register each environment's redirect URI (e.g. `https://yourdomain.com/callback` for production, `https://yourbranch-yourapp.vercel.app/callback` for previews if needed).
5. Set `NEXT_PUBLIC_SITE_URL` to the canonical production URL — drives metadataBase, sitemap, and robots.
6. Deploy.

## Build phases

Tracked in `slidesgo-clone-spec.md` §14. All phases (0 → 5) shipped. See git history for the per-phase commits.

## Extensibility seams (per spec §12)

These are intentionally left as drop-in swaps:

- **Data layer.** `getTemplates()` / `getTemplate(slug)` in `src/lib/data.ts` read from a local file today. Swap the inside of those functions to call a CMS or DB — no callsites change.
- **Favorites / recently-viewed.** Add a per-user store; thread through `withAuth()` in `/account`.
- **Billing / paywall.** `Template.requiredPlan` is already reserved in the type. Gate the launch button on plan in `isLaunchable()` when the time comes.
- **Analytics.** Hook points: `<TemplateCard>` (impression on intersection), `CardMedia` (hover-play), the launch button (`onClick` on the `<a>` in detail).
