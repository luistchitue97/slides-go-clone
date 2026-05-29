// Smoke test for the auth gate (spec §13).
//
// Hits each route group and asserts the redirect contract:
//   public routes (/, /sign-in, /sign-up, /sitemap.xml, /robots.txt) → 200
//   protected routes (/gallery, /account, /templates/<slug>) → 307 to WorkOS
//   /callback with no code → 307 to /sign-in?error=callback
//
// Requires the dev or production server to be running. Pass the base URL via:
//   SMOKE_URL=http://localhost:3000 npx tsx scripts/smoke-auth.mts
//
// Defaults to http://localhost:3000.

const BASE = (process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");

type Expect =
  | { status: 200 }
  | { status: 307; locationStartsWith: string };

type Check = { path: string; label: string; expect: Expect };

const checks: Check[] = [
  { path: "/", label: "landing", expect: { status: 200 } },
  { path: "/sign-in", label: "sign-in page", expect: { status: 200 } },
  { path: "/sign-up", label: "sign-up page", expect: { status: 200 } },
  { path: "/sitemap.xml", label: "sitemap", expect: { status: 200 } },
  { path: "/robots.txt", label: "robots", expect: { status: 200 } },
  {
    path: "/gallery",
    label: "gallery (protected)",
    expect: { status: 307, locationStartsWith: "https://api.workos.com/" },
  },
  {
    path: "/gallery?category=marketing&q=pitch",
    label: "gallery with params (protected)",
    expect: { status: 307, locationStartsWith: "https://api.workos.com/" },
  },
  {
    path: "/account",
    label: "account (protected)",
    expect: { status: 307, locationStartsWith: "https://api.workos.com/" },
  },
  {
    path: "/templates/north-star-pitch",
    label: "template detail (protected)",
    expect: { status: 307, locationStartsWith: "https://api.workos.com/" },
  },
  {
    path: "/callback",
    label: "callback with no code (friendly redirect)",
    expect: { status: 307, locationStartsWith: `${BASE}/sign-in?error=callback` },
  },
];

let failed = 0;
for (const c of checks) {
  const url = `${BASE}${c.path}`;
  const res = await fetch(url, { redirect: "manual" });
  const status = res.status;
  const location = res.headers.get("location") ?? "";

  let ok = false;
  if (c.expect.status === 200 && status === 200) ok = true;
  if (
    c.expect.status === 307 &&
    status === 307 &&
    location.startsWith(c.expect.locationStartsWith)
  )
    ok = true;

  const flag = ok ? "PASS" : "FAIL";
  console.log(`${flag.padEnd(5)} ${c.label.padEnd(42)} ${c.path}  →  ${status} ${location.slice(0, 70)}`);
  if (!ok) failed++;
}

console.log();
console.log(failed === 0 ? `All ${checks.length} checks passed.` : `${failed} of ${checks.length} failed.`);
process.exit(failed === 0 ? 0 : 1);
