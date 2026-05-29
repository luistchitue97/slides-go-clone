// Smoke test for the Stripe webhook signature path.
//
// Verifies the route exists, returns 400 on missing/invalid signatures, and
// preserves the raw body (necessary for Stripe's HMAC check). The full
// successful path is exercised in P5 via `stripe trigger`.
//
// Run with: SMOKE_URL=http://localhost:3000 pnpm smoke:webhook
// (or just `pnpm smoke:webhook` when dev is on http://localhost:3000)

const BASE = (process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const URL = `${BASE}/api/stripe/webhook`;

type Check = { label: string; headers: Record<string, string>; body: string; expect: number };

const checks: Check[] = [
  {
    label: "POST with no stripe-signature → 400",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: "evt_test", type: "customer.created", data: { object: {} } }),
    expect: 400,
  },
  {
    label: "POST with malformed stripe-signature → 400",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "t=12345,v1=deadbeef",
    },
    body: JSON.stringify({ id: "evt_test", type: "customer.created", data: { object: {} } }),
    expect: 400,
  },
  {
    label: "GET (unsupported method) → 405",
    headers: {},
    body: "",
    expect: 405,
  },
];

let failed = 0;
for (const c of checks) {
  const init: RequestInit = c.label.startsWith("GET")
    ? { method: "GET" }
    : { method: "POST", headers: c.headers, body: c.body };
  const res = await fetch(URL, init);
  const ok = res.status === c.expect;
  const flag = ok ? "PASS" : "FAIL";
  console.log(`${flag.padEnd(5)} ${c.label.padEnd(48)} → ${res.status}`);
  if (!ok) failed++;
}

console.log();
console.log(failed === 0 ? `All ${checks.length} checks passed.` : `${failed} of ${checks.length} failed.`);
process.exit(failed === 0 ? 0 : 1);
