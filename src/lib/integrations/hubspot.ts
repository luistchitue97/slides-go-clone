import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { integrationAccounts } from "@/db/schema";
import { encryptSecret, decryptSecret } from "@/lib/integrations/crypto";
import { SITE_URL } from "@/lib/site";

const AUTHORIZE_URL = "https://app.hubspot.com/oauth/authorize";
const TOKEN_URL = "https://api.hubapi.com/oauth/v3/token";
const REFRESH_TOKENS_URL = "https://api.hubapi.com/oauth/v1/refresh-tokens";

/** Must exactly match the redirect_uri used in the authorize request. */
export function getHubspotRedirectUri(): string {
  return `${SITE_URL}/api/integrations/hubspot/callback`;
}

// Must match the scopes configured on the HubSpot app.
export const HUBSPOT_SCOPES = [
  "oauth",
  "crm.objects.deals.read",
  "crm.objects.companies.read",
  "crm.objects.contacts.read",
  "crm.schemas.deals.read",
];

export function getHubspotClientId(): string {
  const id = process.env.HUBSPOT_CLIENT_ID;
  if (!id) throw new Error("HUBSPOT_CLIENT_ID is not set. Add it from your HubSpot app settings.");
  return id;
}

function getHubspotClientSecret(): string {
  const secret = process.env.HUBSPOT_CLIENT_SECRET;
  if (!secret) throw new Error("HUBSPOT_CLIENT_SECRET is not set. Add it from your HubSpot app settings.");
  return secret;
}

export function buildAuthorizeUrl({ state, redirectUri }: { state: string; redirectUri: string }): string {
  // HubSpot requires scopes separated by URL-encoded spaces (%20). URLSearchParams
  // would emit "+", which HubSpot rejects — so build the query by hand.
  const scope = HUBSPOT_SCOPES.map(encodeURIComponent).join("%20");
  const query = [
    `client_id=${encodeURIComponent(getHubspotClientId())}`,
    `redirect_uri=${encodeURIComponent(redirectUri)}`,
    `scope=${scope}`,
    `state=${encodeURIComponent(state)}`,
  ].join("&");
  return `${AUTHORIZE_URL}?${query}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  hub_id?: number;
  scopes?: string[];
  token_type?: string;
};

async function postToken(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HubSpot token request failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as TokenResponse;
}

export function exchangeCode(code: string): Promise<TokenResponse> {
  return postToken({
    grant_type: "authorization_code",
    client_id: getHubspotClientId(),
    client_secret: getHubspotClientSecret(),
    redirect_uri: getHubspotRedirectUri(),
    code,
  });
}

export function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  // v3 refresh requires redirect_uri (unlike the old v1 endpoint).
  return postToken({
    grant_type: "refresh_token",
    client_id: getHubspotClientId(),
    client_secret: getHubspotClientSecret(),
    redirect_uri: getHubspotRedirectUri(),
    refresh_token: refreshToken,
  });
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await fetch(`${REFRESH_TOKENS_URL}/${refreshToken}`, { method: "DELETE" });
}

type TokenAccount = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};

/**
 * Returns a valid HubSpot access token for a connected account, refreshing and
 * persisting it (re-encrypted) when it's within 60s of expiry.
 */
export async function getHubspotAccessToken(account: TokenAccount): Promise<string> {
  if (!account.refreshToken) {
    throw new Error(`HubSpot account ${account.id} has no stored refresh token`);
  }

  const stillValid =
    account.accessToken &&
    account.tokenExpiresAt &&
    account.tokenExpiresAt.getTime() - Date.now() > 60_000;
  if (stillValid && account.accessToken) {
    return decryptSecret(account.accessToken);
  }

  const refreshed = await refreshAccessToken(decryptSecret(account.refreshToken));
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

  await db
    .update(integrationAccounts)
    .set({
      accessToken: encryptSecret(refreshed.access_token),
      // HubSpot may rotate the refresh token; persist it if returned.
      refreshToken: refreshed.refresh_token
        ? encryptSecret(refreshed.refresh_token)
        : account.refreshToken,
      tokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(integrationAccounts.id, account.id));

  return refreshed.access_token;
}
