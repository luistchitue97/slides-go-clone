"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { db } from "@/db";
import { integrationAccounts, reportConnections } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { isReportKey } from "@/lib/integrations/reports";
import { buildAuthorizeUrl as hubspotAuthorizeUrl, revokeRefreshToken } from "@/lib/integrations/hubspot";
import { decryptSecret } from "@/lib/integrations/crypto";

type Provider = "stripe" | "hubspot";
const PROVIDERS = new Set<Provider>(["stripe", "hubspot"]);
function isProvider(v: unknown): v is Provider {
  return typeof v === "string" && PROVIDERS.has(v as Provider);
}

function getStripeConnectClientId(): string {
  const id = process.env.STRIPE_CONNECT_CLIENT_ID;
  if (!id) {
    throw new Error(
      "STRIPE_CONNECT_CLIENT_ID is not set. Copy your platform's OAuth client id " +
        "(ca_…) from Stripe → Connect settings into .env.local / Vercel.",
    );
  }
  return id;
}

/** Admin-of-an-org guard shared by every integration action. Returns the org id. */
async function requireOrgAdmin(): Promise<string | null> {
  const { organizationId, role } = await withAuth({ ensureSignedIn: true });
  if (!organizationId) return null;
  if (role !== "admin") return null;
  return organizationId;
}

export async function startConnect(formData: FormData) {
  const organizationId = await requireOrgAdmin();
  if (!organizationId) redirect("/account/organizations");

  const reportKey = formData.get("reportKey");
  const provider = formData.get("provider");
  if (!isReportKey(reportKey) || !isProvider(provider)) return;

  // CSRF: a random nonce lives in an httpOnly cookie (per provider) and is
  // echoed in `state`; the callback rejects the response unless they match.
  const nonce = randomBytes(16).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(`${provider}_connect_nonce`, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const state = Buffer.from(JSON.stringify({ nonce, reportKey, provider })).toString("base64url");
  const redirectUri = `${SITE_URL}/api/integrations/${provider}/callback`;

  let url: string;
  if (provider === "stripe") {
    // Stripe only provisions read_write for Standard Connect by default; we only
    // ever make read calls.
    url =
      "https://connect.stripe.com/oauth/authorize?response_type=code" +
      `&client_id=${encodeURIComponent(getStripeConnectClientId())}` +
      "&scope=read_write" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;
  } else {
    url = hubspotAuthorizeUrl({ state, redirectUri });
  }

  redirect(url);
}

/** One-click reuse: point a report at an account the org has already connected. */
export async function attachExistingAccount(formData: FormData) {
  const organizationId = await requireOrgAdmin();
  if (!organizationId) return;

  const reportKey = formData.get("reportKey");
  const provider = formData.get("provider");
  const accountId = formData.get("accountId");
  if (!isReportKey(reportKey) || !isProvider(provider)) return;
  if (typeof accountId !== "string" || !accountId) return;

  const [account] = await db
    .select({ id: integrationAccounts.id })
    .from(integrationAccounts)
    .where(
      and(
        eq(integrationAccounts.id, accountId),
        eq(integrationAccounts.organizationId, organizationId),
        eq(integrationAccounts.provider, provider),
        eq(integrationAccounts.status, "connected"),
      ),
    )
    .limit(1);
  if (!account) return;

  await db
    .insert(reportConnections)
    .values({ organizationId, reportKey, provider, accountId: account.id })
    .onConflictDoUpdate({
      target: [
        reportConnections.organizationId,
        reportConnections.reportKey,
        reportConnections.provider,
      ],
      set: { accountId: account.id, updatedAt: new Date() },
    });

  revalidatePath("/account/integrations");
}

export async function disconnectReport(formData: FormData) {
  const organizationId = await requireOrgAdmin();
  if (!organizationId) return;

  const reportKey = formData.get("reportKey");
  const provider = formData.get("provider");
  if (!isReportKey(reportKey) || !isProvider(provider)) return;

  const [link] = await db
    .select({ accountId: reportConnections.accountId })
    .from(reportConnections)
    .where(
      and(
        eq(reportConnections.organizationId, organizationId),
        eq(reportConnections.reportKey, reportKey),
        eq(reportConnections.provider, provider),
      ),
    )
    .limit(1);
  if (!link) return;

  await db
    .delete(reportConnections)
    .where(
      and(
        eq(reportConnections.organizationId, organizationId),
        eq(reportConnections.reportKey, reportKey),
        eq(reportConnections.provider, provider),
      ),
    );

  // If no report references this account anymore, revoke it at the provider and
  // drop the account row (cleans up rather than leaving an orphan).
  const remaining = await db
    .select({ id: reportConnections.id })
    .from(reportConnections)
    .where(eq(reportConnections.accountId, link.accountId))
    .limit(1);

  if (remaining.length === 0) {
    const [account] = await db
      .select({
        id: integrationAccounts.id,
        externalAccountId: integrationAccounts.externalAccountId,
        refreshToken: integrationAccounts.refreshToken,
      })
      .from(integrationAccounts)
      .where(eq(integrationAccounts.id, link.accountId))
      .limit(1);

    if (account) {
      try {
        if (provider === "stripe") {
          await getStripe().oauth.deauthorize({
            client_id: getStripeConnectClientId(),
            stripe_user_id: account.externalAccountId,
          });
        } else if (provider === "hubspot" && account.refreshToken) {
          await revokeRefreshToken(decryptSecret(account.refreshToken));
        }
      } catch (err) {
        // Don't fail the disconnect if the provider rejects the revoke.
        console.error(`[integrations] ${provider} revoke failed:`, err);
      }
      await db.delete(integrationAccounts).where(eq(integrationAccounts.id, account.id));
    }
  }

  revalidatePath("/account/integrations");
}
