import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { integrationAccounts, reportConnections } from "@/db/schema";
import { IntegrationsTab } from "../integrations-tab";
import { isReportKey, type ReportKey } from "@/lib/integrations/reports";

export const metadata: Metadata = { title: "Integrations" };

type ProviderKey = "stripe" | "hubspot";
const PROVIDERS: ProviderKey[] = ["stripe", "hubspot"];

export type Conn = {
  accountId: string;
  displayName: string | null;
  externalAccountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};
export type OrgAccount = { id: string; displayName: string | null; externalAccountId: string };

export default async function IntegrationsPage() {
  const { organizationId, role } = await withAuth({ ensureSignedIn: true });
  const isAdmin = role === "admin";

  const emptyAccounts: Record<ProviderKey, OrgAccount[]> = { stripe: [], hubspot: [] };

  if (!organizationId) {
    return (
      <IntegrationsTab
        orgPresent={false}
        isAdmin={isAdmin}
        orgAccountsByProvider={emptyAccounts}
        connectionsByReport={{}}
      />
    );
  }

  const [accountRows, linkRows] = await Promise.all([
    db
      .select({
        id: integrationAccounts.id,
        provider: integrationAccounts.provider,
        displayName: integrationAccounts.displayName,
        externalAccountId: integrationAccounts.externalAccountId,
      })
      .from(integrationAccounts)
      .where(
        and(
          eq(integrationAccounts.organizationId, organizationId),
          inArray(integrationAccounts.provider, PROVIDERS),
          eq(integrationAccounts.status, "connected"),
        ),
      ),
    db
      .select({
        reportKey: reportConnections.reportKey,
        provider: reportConnections.provider,
        accountId: reportConnections.accountId,
        displayName: integrationAccounts.displayName,
        externalAccountId: integrationAccounts.externalAccountId,
        accessToken: integrationAccounts.accessToken,
        refreshToken: integrationAccounts.refreshToken,
        tokenExpiresAt: integrationAccounts.tokenExpiresAt,
      })
      .from(reportConnections)
      .innerJoin(integrationAccounts, eq(reportConnections.accountId, integrationAccounts.id))
      .where(
        and(
          eq(reportConnections.organizationId, organizationId),
          inArray(reportConnections.provider, PROVIDERS),
        ),
      ),
  ]);

  const orgAccountsByProvider: Record<ProviderKey, OrgAccount[]> = { stripe: [], hubspot: [] };
  for (const a of accountRows) {
    if (a.provider === "stripe" || a.provider === "hubspot") {
      orgAccountsByProvider[a.provider].push({
        id: a.id,
        displayName: a.displayName,
        externalAccountId: a.externalAccountId,
      });
    }
  }

  const connectionsByReport: Partial<Record<ReportKey, Partial<Record<ProviderKey, Conn>>>> = {};
  for (const l of linkRows) {
    if (!isReportKey(l.reportKey)) continue;
    if (l.provider !== "stripe" && l.provider !== "hubspot") continue;
    (connectionsByReport[l.reportKey] ??= {})[l.provider] = {
      accountId: l.accountId,
      displayName: l.displayName,
      externalAccountId: l.externalAccountId,
      accessToken: l.accessToken,
      refreshToken: l.refreshToken,
      tokenExpiresAt: l.tokenExpiresAt,
    };
  }

  return (
    <IntegrationsTab
      orgPresent
      isAdmin={isAdmin}
      orgAccountsByProvider={orgAccountsByProvider}
      connectionsByReport={connectionsByReport}
    />
  );
}
