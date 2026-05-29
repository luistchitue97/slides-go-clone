// Smoke test for the Stripe webhook signature path.
//
// Always-runs:
//   1. POST with no stripe-signature → 400
//   2. POST with malformed stripe-signature → 400
//   3. GET (unsupported method) → 405
//
// Opt-in (when STRIPE_WEBHOOK_SECRET is set in env):
//   4. POST with a properly signed customer.created event → 200
//      (event type isn't handled, so the route returns 200 immediately;
//      this proves signature verification against the configured secret)
//
// The end-to-end signed-event path with a real checkout.session.completed
// is exercised via the Stripe CLI — see the Paid access section in README.
//
// Run with: SMOKE_URL=http://localhost:3000 pnpm smoke:webhook

import "dotenv/config";
import { config } from "dotenv";

config({ path: ".env.local" });

const BASE = (process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const URL = `${BASE}/api/stripe/webhook`;
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET;

type Check = { label: string; init: RequestInit; expect: number; skip?: boolean };

const checks: Check[] = [
  {
    label: "POST with no stripe-signature → 400",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "evt_test", type: "customer.created", data: { object: {} } }),
    },
    expect: 400,
  },
  {
    label: "POST with malformed stripe-signature → 400",
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=12345,v1=deadbeef",
      },
      body: JSON.stringify({ id: "evt_test", type: "customer.created", data: { object: {} } }),
    },
    expect: 400,
  },
  {
    label: "GET (unsupported method) → 405",
    init: { method: "GET" },
    expect: 405,
  },
];

if (WHSEC) {
  // Build a properly signed event using the same algorithm Stripe uses
  // (HMAC-SHA256 of `timestamp.payload` with the whsec value as key).
  const payload = JSON.stringify({
    id: "evt_smoke",
    type: "customer.created",
    data: { object: { id: "cus_smoke" } },
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await hmacHex(WHSEC, `${timestamp}.${payload}`);
  checks.push({
    label: "POST with valid signature (ignored event type) → 200",
    init: {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "stripe-signature": `t=${timestamp},v1=${signature}`,
      },
      body: payload,
    },
    expect: 200,
  });
} else {
  checks.push({
    label: "valid-signature check skipped (set STRIPE_WEBHOOK_SECRET to enable)",
    init: { method: "GET" },
    expect: -1,
    skip: true,
  });
}

let failed = 0;
for (const c of checks) {
  if (c.skip) {
    console.log(`SKIP  ${c.label}`);
    continue;
  }
  const res = await fetch(URL, c.init);
  const ok = res.status === c.expect;
  console.log(`${(ok ? "PASS" : "FAIL").padEnd(5)} ${c.label.padEnd(60)} → ${res.status}`);
  if (!ok) failed++;
}

console.log();
console.log(failed === 0 ? "All non-skipped checks passed." : `${failed} failed.`);
process.exit(failed === 0 ? 0 : 1);

async function hmacHex(secret: string, message: string): Promise<string> {
  const { createHmac } = await import("node:crypto");
  return createHmac("sha256", secret).update(message).digest("hex");
}
