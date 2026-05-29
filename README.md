# DeckForge

A polished, animated **Next.js + Tailwind + GSAP + WorkOS + Stripe** web app that showcases a curated library of business presentation templates. Each template is a separate, independently deployed app referenced by URL — this app discovers, previews, gates behind a one-time **all-access** purchase, and links out to them.

Built in phases against [`slidesgo-clone-spec.md`](./slidesgo-clone-spec.md).

## What's in the box

- **Landing page** with hero, value props, featured templates, and CTA. Tasteful GSAP entrance + scroll-trigger reveals, gated on `prefers-reduced-motion`. CTAs adapt to signed-in / entitled state.
- **WorkOS AuthKit** sign-in / sign-up / sign-out via the hosted flow. Middleware-protected gallery, account, and template detail routes. Redirect-after-login round-trips through the sealed OAuth state.
- **Gallery** with URL-driven category filter, search (debounced), and sort. Skeleton loader, empty state with reset, aria-live count, and a "Locked" pill on cards until the user has all-access.
- **Template detail** with OG metadata; the launch CTA is one of three states — Open template (entitled), Buy access — $X (unentitled), Temporarily unavailable (broken/disabled). **`launchUrl` is omitted from the HTML for unentitled users** — paywall holds at the DOM level.
- **All-access payment** via Stripe Checkout (Hosted) with Stripe Tax. The webhook at `/api/stripe/webhook` is the **only** path that grants entitlement; duplicate Stripe deliveries are no-ops via a unique `stripe_session_id` and a kind allowlist.
- **Card media** with the full §9 fallback chain: lazy-loaded video on hover/focus/tap (desktop or touch) → static thumbnail → branded SVG placeholder. Skipped entirely on reduced-motion / data-saver.
- **Hardening**: skip-to-content link, semantic HTML, AA contrast, focus-visible everywhere, sitemap, robots, CSP + security headers, branded 404/500, env-driven canonical URLs.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`
- **GSAP 3** via `@gsap/react` (`useGSAP` for auto-cleanup) + `ScrollTrigger`
- **WorkOS AuthKit** via `@workos-inc/authkit-nextjs`
- **Stripe** (Hosted Checkout + Stripe Tax + Webhooks)
- **Neon Postgres** via `@neondatabase/serverless` + **Drizzle ORM**
- `pnpm` (pinned in `packageManager`), Node 20 LTS (pinned in `.nvmrc`)

## Local setup

```bash
nvm use                       # picks up Node 20 from .nvmrc
pnpm install
cp .env.example .env.local    # fill in WorkOS, Neon, and Stripe values

# Apply DB migrations against your Neon database
pnpm db:migrate

pnpm dev
```

For the **paid-access flow** during dev you'll also want the Stripe CLI running in a second terminal — see [Paid access](#paid-access).

App runs on http://localhost:3000.

## Scripts

| Script              | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm dev`          | Dev server                                                         |
| `pnpm build`        | Production build                                                   |
| `pnpm start`        | Serve the production build                                         |
| `pnpm lint`         | ESLint (`next/core-web-vitals` + `next/typescript`)                |
| `pnpm format`       | Prettier write                                                     |
| `pnpm smoke:data`   | Data-layer smoke (filter/search/sort + URL helpers, no server)     |
| `pnpm smoke:auth`   | Auth-gate smoke (asserts redirect contract — needs a live server)  |
| `pnpm smoke:webhook`| Stripe webhook signature smoke (signed-event check when whsec set) |
| `pnpm db:generate`  | Generate a new Drizzle migration from `src/db/schema.ts`           |
| `pnpm db:migrate`   | Apply pending migrations to `DATABASE_URL_UNPOOLED`                |
| `pnpm db:studio`    | Open Drizzle Studio against the local DB                           |

## Environment variables

See [`.env.example`](./.env.example).

| Variable                          | Notes                                                            |
| --------------------------------- | ---------------------------------------------------------------- |
| `WORKOS_API_KEY`                  | From the WorkOS dashboard                                        |
| `WORKOS_CLIENT_ID`                | From the WorkOS dashboard                                        |
| `WORKOS_COOKIE_PASSWORD`          | 32+ char random string. `openssl rand -base64 32`                |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Must match the redirect registered in WorkOS for this env        |
| `NEXT_PUBLIC_SITE_URL`            | Canonical site URL — used by metadataBase, sitemap, robots       |
| `DATABASE_URL`                    | Neon pooled connection (runtime queries)                         |
| `DATABASE_URL_UNPOOLED`           | Neon direct connection (migrations / DDL)                        |
| `STRIPE_SECRET_KEY`               | `sk_test_…` in dev, `sk_live_…` in prod                          |
| `STRIPE_WEBHOOK_SECRET`           | `whsec_…` from the Stripe dashboard or `stripe listen` output    |
| `STRIPE_PRICE_ALL_ACCESS`         | Either the raw `price_…` id or the lookup_key on the Stripe Price |

> AuthKit reads the redirect URI from `NEXT_PUBLIC_WORKOS_REDIRECT_URI` (not the unprefixed name). Don't trust generic WorkOS docs on this one — the `@workos-inc/authkit-nextjs` package uses the prefixed env var even though the value is consumed server-side.

## Paid access

DeckForge gates `Open template` on a one-time **all-access** purchase. The flow:

```
User clicks "Buy access — $X"  →  startCheckout server action
  →  resolves price via getAllAccessPrice() (lookup_key or raw id)
  →  creates Stripe Checkout Session with client_reference_id = WorkOS user id
  →  redirect to Stripe-hosted Checkout page (with automatic_tax on)
User pays
  →  Stripe redirects browser to /account?purchase=success    (UI hint only)
  →  Stripe sends checkout.session.completed to /api/stripe/webhook
       webhook verifies HMAC signature
       webhook upserts app_users + inserts purchases (idempotent on session id)
Subsequent renders see allAccess === true, swap CTAs to "Open template".
```

The webhook is the only path that grants access. The success redirect is a UI hint — never trusted as a grant.

### Stripe dashboard setup (one-time)

1. **Create the product + price**
   - Stripe dashboard → Products → New product → "DeckForge All-Access"
   - One-time price, currency USD, your chosen amount
   - Set a **lookup_key** on the price (e.g. `all_access_lifetime_v1`) — copy this into `STRIPE_PRICE_ALL_ACCESS` so swapping prices later doesn't require a code deploy
2. **Enable Stripe Tax** (Stripe dashboard → Tax → Get started). Required because `automatic_tax` is on in the Checkout Session.
3. **Webhook endpoint** (production)
   - Stripe dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Event: `checkout.session.completed`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel

### Local dev (with the Stripe CLI)

```bash
# Terminal 1
pnpm dev

# Terminal 2 — forwards Stripe events to your local webhook + prints whsec_…
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the whsec_… it prints into .env.local as STRIPE_WEBHOOK_SECRET
# (the CLI rotates this per listen session)

# Terminal 3 — exercise a fake successful checkout
stripe trigger checkout.session.completed
```

After `stripe trigger`, check `pnpm db:studio` — there should be a new row in `purchases`. Run `stripe trigger checkout.session.completed` a second time; the row count should **not** change (idempotency via `stripe_session_id` unique constraint).

The full browser flow also works locally: click `Buy access` on a detail page, complete the Stripe test card on Checkout (`4242 4242 4242 4242`, any future date, any CVC), and you'll come back to `/account?purchase=success` with the purchase listed.

## Project structure

```
src/
  app/
    layout.tsx                       # Root layout, fonts, skip-link, header/footer
    page.tsx                         # Landing (entitlement-aware CTAs)
    sign-in/, sign-up/               # Hosted-flow handoff via server actions
    callback/route.ts                # WorkOS callback (friendly retry on error)
    gallery/                         # Browse — filter/search/sort + skeleton + locked pill
    templates/[slug]/                # Detail + Open/Buy/Unavailable launch pane
    account/                         # Profile + plan + purchase history + sign-out
    api/stripe/webhook/route.ts      # Stripe webhook — signature + idempotent insert
    not-found.tsx, error.tsx,        # Branded boundaries
      global-error.tsx
    robots.ts, sitemap.ts            # SEO
    globals.css                      # Tailwind + design tokens
  components/
    site-header.tsx, site-footer.tsx
    landing/                         # Hero, value props, featured, CTA
    gallery/                         # Pills, controls, empty state
    templates/                       # Card (+ locked pill), CardMedia, ImageWithFallback
    motion/reveal.tsx                # GSAP-driven Reveal with matchMedia gating
  data/templates.ts                  # Seed data (swap to CMS/DB later)
  db/
    index.ts                         # Drizzle client (Neon HTTP, lazy via Proxy)
    schema.ts                        # app_users + purchases tables
  drizzle/                           # Generated migrations + meta
  lib/
    data.ts                          # getTemplates / parseCategory / parseSearch / parseSort
    url.ts                           # isExternalHttpUrl / isLaunchable / getLaunchState
    site.ts                          # SITE_URL / SITE_NAME / SITE_DESCRIPTION
    auth-actions.ts                  # signOut / startSignIn / startSignUp server actions
    checkout-actions.ts              # startCheckout (Stripe Checkout Session creator)
    stripe.ts                        # getStripe / getWebhookSecret / getAllAccessPrice
    entitlements.ts                  # getEntitlements (memoized, degrades closed)
  middleware.ts                      # authkitMiddleware — protected route gate
  types/template.ts                  # Template + Category types

public/templates/                    # Placeholder thumbnails + branded fallback
scripts/
  smoke-data.mts                     # Filter/search/sort/URL helpers test
  smoke-auth.mts                     # Auth-gate redirect contract test
  smoke-webhook.mts                  # Webhook signature smoke (+ signed-event when whsec set)
  db-migrate.mts                     # Drizzle migration runner over TCP
```

## Smoke tests

```bash
# Data layer (no server needed)
pnpm smoke:data

# Auth gate (needs a running server)
pnpm dev &
SMOKE_URL=http://localhost:3000 pnpm smoke:auth

# Webhook signature paths (needs a running server)
SMOKE_URL=http://localhost:3000 pnpm smoke:webhook
# When STRIPE_WEBHOOK_SECRET is set in .env.local, also runs a valid-signature
# check using an ignored event type to confirm signature verification.
```

What each smoke asserts:

- `smoke:data` — filter/search/sort behavior, search-param parsers, URL/launchability helpers.
- `smoke:auth` — public routes 200, protected routes 307 to WorkOS with query params preserved through state, `/callback` no-code → `/sign-in?error=callback`.
- `smoke:webhook` — POST without signature 400, POST with malformed signature 400, GET 405, and (with whsec) POST with valid signature 200.

For end-to-end Stripe verification see [Paid access](#paid-access).

## Security

- CSP + `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` configured in [`next.config.ts`](./next.config.ts). `Strict-Transport-Security` is added in production.
- The Stripe webhook is excluded from the AuthKit middleware matcher and validates HMAC signatures before doing anything else; failed verifications return 400.
- Webhook handler enforces a `kind` allowlist (currently only `all_access`) so a leaked signing secret can't pollute the purchases table.
- `purchases.stripe_session_id` is unique with `onConflictDoNothing` → Stripe retries are idempotent.
- `getEntitlements` degrades **closed** on DB failure (returns no-access, logs) — the webhook is the only path that grants, so this can never falsely elevate.
- All external links use `rel="noopener noreferrer"` and `target="_blank"`.
- Launch URLs are validated by `isLaunchable()` — non-http(s) or `disabled: true` templates show "Temporarily unavailable" instead of opening. Unentitled users never see `launchUrl` in the rendered HTML.
- Search-param values are validated by `parseCategory` / `parseSort` / `parseSearch`. Junk falls back to safe defaults.
- The `returnTo` form input is sanitized in `startSignIn` / `startSignUp` to refuse non-same-origin paths (open-redirect prevention). `startCheckout`'s `returnSlug` is restricted to kebab-case ASCII.
- Cookies are `httpOnly`, `sameSite=lax`, `secure` in production — AuthKit defaults, not overridden.

## Deployment

Target: **Vercel**.

1. Push to GitHub.
2. Import the repo in Vercel.
3. **Attach Neon** (Storage → Create Database → Neon). Vercel auto-populates `DATABASE_URL` + `DATABASE_URL_UNPOOLED`.
4. Set the remaining env vars from `.env.example` in **Project Settings → Environment Variables** for each environment (Production / Preview / Development).
5. In the **WorkOS dashboard**, register each environment's redirect URI (e.g. `https://yourdomain.com/callback` for production, `https://yourbranch-yourapp.vercel.app/callback` for previews).
6. In the **Stripe dashboard**, register a webhook endpoint at `https://yourdomain.com/api/stripe/webhook` listening for `checkout.session.completed`. Copy the signing secret into Vercel's `STRIPE_WEBHOOK_SECRET`.
7. Set `NEXT_PUBLIC_SITE_URL` to the canonical production URL.
8. Deploy.
9. From a local checkout pointed at the production `DATABASE_URL_UNPOOLED`, run `pnpm db:migrate` (or wire it into a Vercel build step).

## Build phases

Tracked in `slidesgo-clone-spec.md` §14. All phases (0 → 5) plus the payment feature (P1 → P5) shipped. See git history for the per-phase commits.

## Extensibility seams (per spec §12)

These are intentionally left as drop-in swaps:

- **Data layer.** `getTemplates()` / `getTemplate(slug)` in `src/lib/data.ts` read from a local file today. Swap the inside of those functions to call a CMS or DB — no callsites change.
- **Favorites / recently-viewed.** Add a per-user store; thread through `withAuth()` in `/account`.
- **Per-template purchases.** Extend the `KNOWN_PURCHASE_KINDS` allowlist in `src/app/api/stripe/webhook/route.ts` (e.g. `template:<slug>`) and have `getLaunchState` check per-slug entitlement. The `Template.requiredPlan` field is already reserved on the type.
- **Customer Portal / receipts.** Add a "Manage billing" button that creates a Stripe Billing Portal session and redirects to it; surfaces receipt URLs without extra schema.
- **Analytics.** Hook points: `<TemplateCard>` (impression on intersection), `CardMedia` (hover-play), the launch button (`onClick` on the `<a>` in detail), `startCheckout` (entry funnel).
