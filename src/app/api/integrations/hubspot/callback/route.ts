import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { db } from "@/db";
import { integrationAccounts, reportConnections } from "@/db/schema";
import { SITE_URL } from "@/lib/site";
import { isReportKey } from "@/lib/integrations/reports";
import { exchangeCode } from "@/lib/integrations/hubspot";
import { encryptSecret } from "@/lib/integrations/crypto";

/**
 * HubSpot OAuth callback. Exchanges the code for access/refresh tokens, stores
 * them (encrypted) for the org, and links the connected portal to the report
 * the connect flow was started from. Runs on Node (crypto).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROVIDER = "hubspot";
const NONCE_COOKIE = "hubspot_connect_nonce";

function back(params?: Record<string, string>): NextResponse {
  const url = new URL("/account/integrations", SITE_URL);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  if (sp.get("error")) return back({ error: "hubspot_denied" });

  const code = sp.get("code");
  const rawState = sp.get("state");
  if (!code || !rawState) return back({ error: "hubspot_invalid" });

  let reportKey: string;
  let nonce: string;
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8"));
    reportKey = parsed.reportKey;
    nonce = parsed.nonce;
  } catch {
    return back({ error: "hubspot_invalid" });
  }

  const cookieStore = await cookies();
  const cookieNonce = cookieStore.get(NONCE_COOKIE)?.value;
  cookieStore.delete(NONCE_COOKIE);
  if (!nonce || nonce !== cookieNonce || !isReportKey(reportKey)) {
    return back({ error: "hubspot_invalid" });
  }

  const { user, organizationId, role } = await withAuth({ ensureSignedIn: true });
  if (!organizationId || role !== "admin") return back({ error: "hubspot_forbidden" });

  let tokens;
  try {
    tokens = await exchangeCode(code);
  } catch (err) {
    console.error("[integrations/hubspot/callback] token exchange failed:", err);
    return back({ error: "hubspot_failed" });
  }

  // hub_id comes back in the v3 token response; it identifies the connected portal.
  const hubId = tokens.hub_id;
  if (!hubId) return back({ error: "hubspot_failed" });
  const displayName = `HubSpot portal ${hubId}`;

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  const enc = {
    accessToken: encryptSecret(tokens.access_token),
    refreshToken: encryptSecret(tokens.refresh_token),
    tokenExpiresAt: expiresAt,
  };

  const [account] = await db
    .insert(integrationAccounts)
    .values({
      organizationId,
      provider: PROVIDER,
      externalAccountId: String(hubId),
      displayName,
      status: "connected",
      connectedByUserId: user.id,
      ...enc,
    })
    .onConflictDoUpdate({
      target: [
        integrationAccounts.organizationId,
        integrationAccounts.provider,
        integrationAccounts.externalAccountId,
      ],
      set: { displayName, status: "connected", ...enc, updatedAt: new Date() },
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

  return back({ connected: PROVIDER });
}
