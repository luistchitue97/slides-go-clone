import { Suspense } from "react";
import {
  siStripe,
  siHubspot,
  siShopify,
  siIntercom,
  siZendesk,
  siNotion,
  siLinear,
  siAsana,
  siJira,
  siGithub,
  siAirtable,
  siGoogleanalytics,
  siPosthog,
  siMixpanel,
  siLooker,
  siDatadog,
  siSnowflake,
  siGooglebigquery,
  siPostgresql,
  siMongodb,
  siQuickbooks,
  siXero,
} from "simple-icons";
import { REPORT_GROUPS, LIVE_PROVIDERS, type ReportKey } from "@/lib/integrations/reports";
import { startStripeConnect, disconnectReport } from "@/lib/integration-actions";
import { ConnectStripeMenu } from "./integrations/connect-stripe-menu";
import { StripeQbrPreview, StripeQbrPreviewSkeleton } from "./integrations/stripe-qbr-preview";

const ICONS: Record<string, { path: string }> = {
  Stripe: siStripe,
  HubSpot: siHubspot,
  Shopify: siShopify,
  Intercom: siIntercom,
  Zendesk: siZendesk,
  Notion: siNotion,
  Linear: siLinear,
  Asana: siAsana,
  Jira: siJira,
  GitHub: siGithub,
  Airtable: siAirtable,
  "Google Analytics": siGoogleanalytics,
  PostHog: siPosthog,
  Mixpanel: siMixpanel,
  Looker: siLooker,
  Datadog: siDatadog,
  Snowflake: siSnowflake,
  BigQuery: siGooglebigquery,
  PostgreSQL: siPostgresql,
  MongoDB: siMongodb,
  QuickBooks: siQuickbooks,
  Xero: siXero,
};

type StripeConn = { accountId: string; displayName: string | null; externalAccountId: string };
type OrgAccount = { id: string; displayName: string | null; externalAccountId: string };

type Props = {
  orgPresent: boolean;
  isAdmin: boolean;
  orgAccounts: OrgAccount[];
  connectionsByReport: Partial<Record<ReportKey, StripeConn>>;
};

export function IntegrationsTab({ orgPresent, isAdmin, orgAccounts, connectionsByReport }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-white light:text-ink-900">
          Integrations by report
        </h2>
        <p className="mt-1 text-sm text-ink-300 light:text-ink-500">
          {!orgPresent
            ? "Join or create an organization to connect data sources."
            : isAdmin
              ? "Connect a source to start pulling live data into each report. Stripe is live; more are coming soon."
              : "Only org admins can manage connections. Stripe is live; more are coming soon."}
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {REPORT_GROUPS.map((group) => {
          const conn = connectionsByReport[group.key];
          return (
            <li
              key={group.key}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/15 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white"
            >
              <div>
                <h3 className="text-sm font-semibold text-white light:text-ink-900">
                  {group.report}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-400 light:text-ink-500">
                  {group.description}
                </p>
              </div>

              <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
                {group.integrations.map((name) => {
                  const icon = ICONS[name];
                  const isLive = LIVE_PROVIDERS.has(name);
                  return (
                    <li
                      key={name}
                      className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] light:border-ink-900/10 light:bg-ink-50">
                          {icon ? (
                            <svg
                              viewBox="0 0 24 24"
                              width={13}
                              height={13}
                              fill="currentColor"
                              className="text-white/60 light:text-ink-500"
                              aria-hidden
                            >
                              <path d={icon.path} />
                            </svg>
                          ) : null}
                        </span>
                        <span className="text-sm font-medium text-white light:text-ink-900">
                          {name}
                        </span>
                      </div>

                      {isLive ? (
                        <StripeControl
                          reportKey={group.key}
                          conn={conn}
                          orgPresent={orgPresent}
                          isAdmin={isAdmin}
                          orgAccounts={orgAccounts}
                        />
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="shrink-0 cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-400 opacity-50 light:border-ink-900/10 light:bg-ink-50 light:text-ink-500"
                        >
                          Coming soon
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              {group.key === "qbr" && conn ? (
                <Suspense fallback={<StripeQbrPreviewSkeleton />}>
                  <StripeQbrPreview stripeAccountId={conn.externalAccountId} />
                </Suspense>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-ink-400 light:text-ink-500">
        Missing an integration?{" "}
        <a
          href="mailto:support@luistchitue.com"
          className="text-white underline-offset-4 hover:underline light:text-ink-900"
        >
          Let us know →
        </a>
      </p>
    </div>
  );
}

function StripeControl({
  reportKey,
  conn,
  orgPresent,
  isAdmin,
  orgAccounts,
}: {
  reportKey: ReportKey;
  conn: StripeConn | undefined;
  orgPresent: boolean;
  isAdmin: boolean;
  orgAccounts: OrgAccount[];
}) {
  // Connected → status + (admin) disconnect.
  if (conn) {
    return (
      <div className="flex shrink-0 items-center gap-2.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300"
          title={conn.displayName ?? conn.externalAccountId}
        >
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Connected
        </span>
        {isAdmin ? (
          <form action={disconnectReport}>
            <input type="hidden" name="reportKey" value={reportKey} />
            <button
              type="submit"
              className="text-xs text-ink-400 transition hover:text-white light:hover:text-ink-900"
            >
              Disconnect
            </button>
          </form>
        ) : null}
      </div>
    );
  }

  // Not connected, but actions unavailable.
  if (!orgPresent || !isAdmin) {
    return (
      <button
        type="button"
        disabled
        title={!orgPresent ? "Join an organization first" : "Admins only"}
        className="shrink-0 cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-400 opacity-50 light:border-ink-900/10 light:bg-ink-50 light:text-ink-500"
      >
        Connect
      </button>
    );
  }

  // Admin with existing org account(s) → reuse chooser; otherwise plain connect.
  if (orgAccounts.length > 0) {
    return <ConnectStripeMenu reportKey={reportKey} accounts={orgAccounts} />;
  }

  return (
    <form action={startStripeConnect} className="shrink-0">
      <input type="hidden" name="reportKey" value={reportKey} />
      <button
        type="submit"
        className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-ink-200 transition hover:bg-white/[0.08] hover:text-white light:border-ink-900/10 light:bg-ink-50 light:text-ink-600 light:hover:bg-ink-100 light:hover:text-ink-900"
      >
        Connect
      </button>
    </form>
  );
}
