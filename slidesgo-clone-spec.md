# Build Spec — "DeckForge" (Slidesgo-style business template gallery)

> A prompt/specification to hand to Claude Code. Replace the working name "DeckForge" if you have a real one.

## 1. One-line summary

Build a polished, animated **Next.js + Tailwind + GSAP + WorkOS** web app that showcases a curated library of business presentation templates. Each template is a **separate, independently deployed Next.js app** referenced by URL — this app does **not** build the templates themselves; it discovers, previews, gates, and links out to them.

## 2. Goals & non-goals

**Goals**
- A marketing landing page that sells the product and previews templates (cards with hover-play video).
- Authentication via WorkOS (AuthKit). Sign-in and sign-up flows.
- A gated gallery where authenticated users browse, filter, and search templates by business category (marketing, sales, management, investing, finance, ops, etc.) and launch them.
- Heavy but tasteful GSAP motion; strong visual design; fully responsive.

**Non-goals (explicitly out of scope)**
- Do **not** build the template apps or any in-template editor. Templates live elsewhere; we only store metadata + a launch URL.
- No payment/billing in v1 (leave a clean seam for it — see §12).
- No user-generated content or template uploads in v1.

## 3. Tech stack (pin these)

- **Next.js (App Router), latest stable**, TypeScript, React Server Components by default.
- **Tailwind CSS v4** (or v3 if the team prefers a stable config), with a small design-token layer (see §8).
- **GSAP 3** via the official **`@gsap/react`** package and the `useGSAP()` hook (not raw `useEffect`) — this handles cleanup automatically. Use `ScrollTrigger` for scroll-driven reveals. Confirm current plugin licensing before relying on any formerly-premium plugin (e.g. SplitText); fall back to free alternatives if unclear.
- **WorkOS AuthKit** via **`@workos-inc/authkit-nextjs`** for auth + session management.
- State: keep it minimal — server components + URL search params for filters; avoid a global store unless needed.
- Package manager + Node version pinned (e.g. `pnpm`, Node 20 LTS) via `.nvmrc` / `engines`.

## 4. Architecture & how templates are referenced

Each template is described by metadata, **not** code in this repo.

**Assumption to confirm:** template data starts as a typed local file (`/data/templates.ts`) so v1 ships without a backend, but the access layer is abstracted behind a `getTemplates()` / `getTemplate(slug)` module so it can later be swapped for a CMS or DB with zero call-site changes.

Template launch strategy — **default: open the deployed template app in a new tab** (`target="_blank"` + `rel="noopener noreferrer"`). Rationale: avoids iframe pitfalls (X-Frame-Options/CSP blocking, broken auth context, nested scroll). Provide an in-app `/templates/[slug]` detail route that shows the full preview, description, and a prominent "Open template" button. (If you instead want an embedded preview, note iframe risks and gate it behind a feature flag.)

Suggested template schema:

```ts
type Template = {
  slug: string;            // stable URL key
  title: string;
  category: Category;      // enum: marketing | sales | management | investing | finance | ops | hr
  tags: string[];
  shortDescription: string;
  longDescription: string;
  thumbnailUrl: string;    // poster / still
  previewVideoUrl: string; // short muted loop (mp4 + webm); optional
  launchUrl: string;       // the deployed template app
  aspectRatio: "16:9";     // for layout stability
  isNew?: boolean;
  publishedAt: string;     // ISO date for sorting
};
```

## 5. Pages & routes

- `/` — public landing page (hero, value props, featured template cards, CTA to sign up).
- `/sign-in`, `/sign-up` — delegate to WorkOS AuthKit hosted flows (or embedded if you prefer; hosted is faster and more secure to ship).
- `/callback` — WorkOS OAuth callback handler.
- `/gallery` — **protected.** Browse all templates with category filter, search, and sort.
- `/templates/[slug]` — **protected.** Template detail + launch button. (Consider letting unauthenticated users *see* the detail page but gate the launch behind sign-in, to aid SEO and sharing — your call.)
- `/account` — minimal: profile info from WorkOS + sign-out.
- `not-found.tsx` (404) and `error.tsx` / `global-error.tsx` (500) at appropriate levels.

## 6. Authentication (WorkOS) — requirements & edge cases

- Use AuthKit middleware to protect `/gallery`, `/templates/*`, and `/account`. Public routes: `/`, auth routes, static assets.
- **Redirect-after-login:** preserve the originally requested URL and return the user there after sign-in (don't always dump them on `/gallery`).
- **Session lifecycle:** handle session expiry and token refresh gracefully; on expiry, redirect to sign-in with a non-alarming message, not a crash.
- **Logout** clears the session and returns to `/`.
- **Auth failure / cancelled login:** the `/callback` route must handle missing/invalid codes and provider errors without throwing a raw 500 — show a friendly retry screen.
- **Already-signed-in users** hitting `/sign-in` or `/sign-up` are redirected to `/gallery`.
- **Secrets:** `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_COOKIE_PASSWORD`, redirect URI — all via env vars, never committed. Provide `.env.example`.
- Cookies: `httpOnly`, `secure` in production, `sameSite=lax`.
- Don't leak auth state to the client beyond what's needed (no tokens in client bundles).

## 7. GSAP / motion requirements & edge cases

- Use `useGSAP()` for all animations so contexts and ScrollTriggers are reverted on unmount (prevents memory leaks and double-firing in React Strict Mode / Fast Refresh).
- GSAP runs **client-side only** — animated components must be client components; never reference `window`/`document` during SSR. Guard or lazy-init accordingly.
- **`prefers-reduced-motion`:** respect it everywhere. Provide a reduced-motion code path that disables non-essential parallax/auto-play/scrub and keeps content fully usable. This is a hard requirement, not a nice-to-have.
- ScrollTrigger: call `ScrollTrigger.refresh()` after async content/layout shifts (e.g. images/fonts loading) so triggers measure correctly.
- Animations must **never block content** — text and interactive elements should be readable/usable even if JS/GSAP fails to load (animate from a visible default, or reveal on load failure).
- Keep it performant: animate `transform`/`opacity` (GPU-friendly), avoid layout-thrashing properties; cap simultaneous animations; debounce scroll-driven work.

## 8. Visual design & responsiveness

- Define design tokens once (color palette, type scale, spacing, radius, shadow) and reference them — avoid scattered magic values. Aim for a confident, modern, "premium SaaS" look, not generic AI-template gray.
- Dark/light: at minimum ship one polished theme; if doing both, respect system preference.
- Fully responsive: mobile (single-column cards, tap-to-play video), tablet, desktop. Test at 360px, 768px, 1024px, 1440px.
- Reserve aspect-ratio boxes for thumbnails/videos to prevent layout shift (CLS).
- Use `next/font` for self-hosted fonts (no FOIT/FOUT, no external blocking request).

## 9. Template cards & video preview — edge cases

- Videos: `muted`, `loop`, `playsInline`, **autoplay only on hover/focus** (desktop) and tap (mobile); always provide a `poster`/thumbnail fallback. Ship both `mp4` (H.264) and `webm`.
- **Lazy-load** videos (only load/play when in/near viewport) to protect bandwidth and performance; don't autoplay a dozen videos at once.
- **Missing/broken media:** if `previewVideoUrl` is absent or fails, fall back to the static thumbnail; if the thumbnail also fails, show a branded placeholder — never a broken-image icon.
- Respect `prefers-reduced-motion` and data-saver: don't auto-play; show poster + a play button.
- Cards are keyboard-focusable and operable; the whole card is a link with an accessible name.

## 10. Gallery behavior — edge cases

- **Filtering** by category and **search** by title/tag, driven by URL search params (shareable, back-button friendly).
- **Empty states:** "no templates match" with a clear reset action; never a blank screen.
- **Loading states:** skeletons via `loading.tsx` / Suspense; avoid layout shift.
- **Sorting:** newest / A–Z at minimum.
- Pagination or infinite scroll if the catalog grows (start simple; design the data layer to support it).
- **Dead launch URL:** validate/sanitize `launchUrl`; if a template's target is known-down (optional health check or a `disabled` flag), show "temporarily unavailable" instead of sending users to an error.

## 11. Cross-cutting: accessibility, SEO, performance, errors

- **Accessibility:** semantic HTML, keyboard navigation, visible focus states, ARIA where needed, WCAG AA color contrast, focus management on route/modal changes, accessible names for icon buttons.
- **SEO/social:** per-page `metadata`, Open Graph + Twitter cards (especially landing + template detail), sitemap, robots, canonical URLs. Decide which template detail pages are public for indexing.
- **Performance:** `next/image` for all raster images, route-level code splitting, lazy-load below-the-fold media, target good Core Web Vitals (LCP/CLS/INP). Audit bundle size of GSAP usage.
- **Error handling:** error boundaries at layout level; friendly `not-found` and `error` pages; never surface stack traces to users in production.
- **Security:** validate external URLs, set a sensible Content-Security-Policy, `rel="noopener noreferrer"` on all external links, no secrets client-side, rate-limit any future API routes.

## 12. Extensibility seams (don't build, just don't block)

- Data layer abstracted so local file → CMS/DB is a drop-in swap.
- Favorites/recently-viewed (would need a per-user store).
- Billing/paywall (WorkOS supports org/role concepts; keep a `requiredPlan` field reserved).
- Analytics hook points (page views, card hovers, launches).

## 13. Deliverables & dev experience

- Clean repo structure, TypeScript throughout, ESLint + Prettier configured.
- `README.md` with setup, env vars, run/build/deploy steps.
- `.env.example` with every required variable documented (no real secrets).
- Sensible commit history; the app must run with `pnpm install && pnpm dev` after env setup.
- Target deployment: Vercel (note required env vars and the WorkOS redirect URI per environment).
- At least smoke-level tests for the auth gate (protected route redirects when logged out) and the data layer.

## 14. Build order (do it in these phases — pause for review after each)

Build incrementally. **At the end of each phase, stop, summarize what changed, and wait for review before starting the next.** Do not generate the whole app in one pass. If a phase reveals that something in this spec is ambiguous or better done differently, flag it rather than guessing silently.

**Phase 0 — Scaffold & foundations**
- Initialize Next.js (App Router) + TypeScript + Tailwind + ESLint/Prettier; pin Node/package-manager versions.
- Set up design tokens (§8), `next/font`, base layout, and the `getTemplates()`/`getTemplate(slug)` data layer with placeholder data and the `Template` type.
- Add `.env.example`, a starter `README.md`, and the route skeleton (empty pages for §5) plus `not-found`/`error` boundaries.
- **Review gate:** project runs (`pnpm dev`), folder structure and stack are confirmed, before any feature code.

**Phase 1 — Authentication (WorkOS)**
- Wire up AuthKit: middleware-protected routes, `/sign-in`, `/sign-up`, `/callback`, logout, `/account`.
- Implement the auth edge cases in §6 (redirect-after-login, expiry/refresh, callback errors, already-signed-in redirects).
- **Review gate:** full sign-up → sign-in → protected-route → logout loop works locally. (Requires your WorkOS credentials in `.env.local`.)

**Phase 2 — Landing page**
- Hero, value props, featured template cards, CTA to sign up. Static media first; wire GSAP reveals after layout is stable.
- **Review gate:** landing looks polished and responsive; no layout shift; reduced-motion path works.

**Phase 3 — Gallery & template detail**
- `/gallery` with URL-param filtering/search/sort, skeleton loading, empty states; `/templates/[slug]` detail + launch-in-new-tab; dead-URL handling (§10).
- **Review gate:** browse → filter → open template works end-to-end with placeholder data.

**Phase 4 — Video previews & motion polish**
- Hover/tap autoplay, lazy-loading, the media fallback chain (§9); finalize GSAP/ScrollTrigger across pages with cleanup and `prefers-reduced-motion`.
- **Review gate:** no GSAP leaks across navigation, no console errors, media-failure paths degrade gracefully.

**Phase 5 — Hardening & handoff**
- A11y pass (keyboard, focus, AA contrast), SEO/OG metadata, performance/CWV audit, smoke tests, branded 404/500, CSP/security review, README finalization.
- **Review gate:** all acceptance criteria in §15 pass.

> Suggested checkpoints to swap in real data: real WorkOS credentials before Phase 1; real template metadata (titles, thumbnails, preview videos, `launchUrl`s) before or during Phase 3.

## 15. Acceptance criteria (definition of done)

1. Unauthenticated user sees a polished, animated landing page and can reach sign-up.
2. Sign-up → sign-in → callback works end-to-end with WorkOS; sessions persist and refresh; logout works.
3. Visiting a protected route while logged out redirects to sign-in and returns the user to the intended page after auth.
4. Authenticated user can browse the gallery, filter by category, search, and launch a template in a new tab.
5. Template cards play preview video on hover/tap with graceful fallbacks; all media-failure paths degrade gracefully.
6. `prefers-reduced-motion` is fully honored; the app is keyboard-navigable and passes a basic a11y pass (AA contrast, focus visible).
7. No console errors; no GSAP memory leaks across navigation; no layout-shift jank on card/video load.
8. Responsive and visually polished at 360 / 768 / 1024 / 1440 px.
9. 404 and 500 states are branded and friendly; no raw stack traces in production.
10. Repo runs from a clean clone with documented env vars.
