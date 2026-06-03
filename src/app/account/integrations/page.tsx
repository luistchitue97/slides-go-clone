import type { Metadata } from "next";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { integrationAccounts, reportConnections } from "@/db/schema";
import { IntegrationsTab } from "../integrations-tab";
import { isReportKey, type ReportKey } from "@/lib/integrations/reports";

export const metadata: Metadata = { title: "Integrations" };

const PROVIDER = "stripe";

type StripeConn = { accountId: string; displayName: string | null; externalAccountId: string };

export default async function IntegrationsPage() {
  const { organizationId, role } = await withAuth({ ensureSignedIn: true });
  const isAdmin = role === "admin";

  if (!organizationId) {
    return (
      <IntegrationsTab
        orgPresent={false}
        isAdmin={isAdmin}
        orgAccounts={[]}
        connectionsByReport={{}}
      />
    );
  }

  const [accounts, links] = await Promise.all([
    db
      .select({
        id: integrationAccounts.id,
        displayName: integrationAccounts.displayName,
        externalAccountId: integrationAccounts.externalAccountId,
      })
      .from(integrationAccounts)
      .where(
        and(
          eq(integrationAccounts.organizationId, organizationId),
          eq(integrationAccounts.provider, PROVIDER),
          eq(integrationAccounts.status, "connected"),
        ),
      ),
    db
      .select({
        reportKey: reportConnections.reportKey,
        accountId: reportConnections.accountId,
        displayName: integrationAccounts.displayName,
        externalAccountId: integrationAccounts.externalAccountId,
      })
      .from(reportConnections)
      .innerJoin(integrationAccounts, eq(reportConnections.accountId, integrationAccounts.id))
      .where(
        and(
          eq(reportConnections.organizationId, organizationId),
          eq(reportConnections.provider, PROVIDER),
        ),
      ),
  ]);

  const connectionsByReport: Partial<Record<ReportKey, StripeConn>> = {};
  for (const l of links) {
    if (!isReportKey(l.reportKey)) continue;
    connectionsByReport[l.reportKey] = {
      accountId: l.accountId,
      displayName: l.displayName,
      externalAccountId: l.externalAccountId,
    };
  }

  return (
    <IntegrationsTab
      orgPresent
      isAdmin={isAdmin}
      orgAccounts={accounts}
      connectionsByReport={connectionsByReport}
    />
  );
}
