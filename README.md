# DeckForge

A polished, animated **Next.js + Tailwind + GSAP + WorkOS** web app that showcases a curated library of business presentation templates. Each template is a separate, independently deployed Next.js app referenced by URL — this app discovers, previews, gates, and links out to them.

> Built in phases against `slidesgo-clone-spec.md`. Phase 0 (scaffold) is complete; Phases 1–5 follow.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`
- **GSAP 3** via `@gsap/react` (Phase 2+)
- **WorkOS AuthKit** via `@workos-inc/authkit-nextjs` (Phase 1)
- `pnpm` (pinned in `packageManager`), Node 20 LTS (pinned in `.nvmrc`)

## Local setup

```bash
nvm use            # picks up Node 20 from .nvmrc
pnpm install
cp .env.example .env.local   # fill in WorkOS values when Phase 1 starts
pnpm dev
```

App runs on http://localhost:3000.

## Scripts

| Script           | What it does                          |
| ---------------- | ------------------------------------- |
| `pnpm dev`       | Run the dev server                    |
| `pnpm build`     | Production build                      |
| `pnpm start`     | Serve the production build            |
| `pnpm lint`      | ESLint (next/core-web-vitals)         |
| `pnpm format`    | Prettier write                        |

## Environment variables

See [`.env.example`](./.env.example). All WorkOS values are required before Phase 1 will run.

| Variable                          | Notes                                                        |
| --------------------------------- | ------------------------------------------------------------ |
| `WORKOS_API_KEY`                  | From the WorkOS dashboard                                    |
| `WORKOS_CLIENT_ID`                | From the WorkOS dashboard                                    |
| `WORKOS_COOKIE_PASSWORD`          | 32+ char random string. `openssl rand -base64 32`            |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | Must match the redirect registered in WorkOS for this env    |

## Project structure

```
src/
  app/                     # App Router routes
    layout.tsx             # Root layout, fonts, header/footer
    page.tsx               # Landing (/)
    sign-in/, sign-up/     # Auth pages (placeholders in Phase 0)
    callback/route.ts      # WorkOS callback handler (Phase 1)
    gallery/               # Protected — browse templates
    templates/[slug]/      # Protected — template detail + launch
    account/               # Protected — profile + sign-out
    not-found.tsx          # Branded 404
    error.tsx              # Route-level error boundary
    global-error.tsx       # Root error boundary
    globals.css            # Tailwind + design tokens
  components/              # Reusable UI
  data/templates.ts        # Local seed data (swap to CMS/DB later)
  lib/data.ts              # getTemplates() / getTemplate() data layer
  types/template.ts        # Template + Category types
```

## Deployment

Target: Vercel. Set every variable from `.env.example` in the project settings, and register the matching `NEXT_PUBLIC_WORKOS_REDIRECT_URI` in the WorkOS dashboard per environment (preview vs. production).

## Build phases

Tracked in `slidesgo-clone-spec.md` §14. Current phase: **Phase 0 — Scaffold & foundations**.
