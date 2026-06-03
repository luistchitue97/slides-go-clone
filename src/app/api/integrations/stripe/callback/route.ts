import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { db } from "@/db";
import { integrationAccounts, reportConnections } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { isReportKey } from "@/lib/integrations/reports";

/**
 * Stripe Connect OAuth callback. Exchanges the authorization code for the
 * connected account id, persists it for the org, and links it to the report
 * the connect flow was started from. Runs on Node (Stripe SDK + crypto).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROVIDER = "stripe";
const NONCE_COOKIE = "stripe_connect_nonce";

function back(params?: Record<string, string>): NextResponse {
  const url = new URL("/account/integrations", SITE_URL);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  // User denied the authorization on Stripe's screen, or Stripe returned an error.
  if (sp.get("error")) return back({ error: "stripe_denied" });

  const code = sp.get("code");
  const rawState = sp.get("state");
  if (!code || !rawState) return back({ error: "stripe_invalid" });

  // Validate state + CSRF nonce.
  let reportKey: string;
  let nonce: string;
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
    reportKey = parsed.reportKey;
    nonce = parsed.nonce;
  } catch {
    return back({ error: "stripe_invalid" });
  }

  const cookieStore = await cookies();
  const cookieNonce = cookieStore.get(NONCE_COOKIE)?.value;
  cookieStore.delete(NONCE_COOKIE);
  if (!nonce || nonce !== cookieNonce || !isReportKey(reportKey)) {
    return back({ error: "stripe_invalid" });
  }

  // Re-assert the same guard the connect action used.
  const { user, organizationId, role } = await withAuth({ ensureSignedIn: true });
  if (!organizationId || role !== "admin") return back({ error: "stripe_forbidden" });

  const stripe = getStripe();

  let stripeUserId: string;
  try {
    const token = await stripe.oauth.token({ grant_type: "authorization_code", code });
    if (!token.stripe_user_id) return back({ error: "stripe_failed" });
    stripeUserId = token.stripe_user_id;
  } catch (err) {
    console.error("[integrations/stripe/callback] token exchange failed:", err);
    return back({ error: "stripe_failed" });
  }

  // Best-effort friendly label for the connected account.
  let displayName: string | null = null;
  try {
    const acct = await stripe.accounts.retrieve(stripeUserId);
    displayName =
      acct.business_profile?.name ??
      acct.settings?.dashboard?.display_name ??
      acct.email ??
      null;
  } catch {
    // Non-fatal — we can show the account id if the label can't be fetched.
  }

  // Upsert the account, then link it to the report.
  const [account] = await db
    .insert(integrationAccounts)
    .values({
      organizationId,
      provider: PROVIDER,
      externalAccountId: stripeUserId,
      displayName,
      status: "connected",
      connectedByUserId: user.id,
    })
    .onConflictDoUpdate({
      target: [
        integrationAccounts.organizationId,
        integrationAccounts.provider,
        integrationAccounts.externalAccountId,
      ],
      set: { displayName, status: "connected", updatedAt: new Date() },
    })
    .returning({ id: integrationAccounts.id });

  await db
    .insert(reportConnections)
    .values({ organizationId, reportKey, provider: PROVIDER, accountId: account.id })
    .onConflictDoUpdate({
      target: [
        reportConnections.organizationId,
        reportConnections.reportKey,
        reportConnections.provider,
      ],
      set: { accountId: account.id, updatedAt: new Date() },
    });

  return back({ connected: "stripe" });
}
