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
import { REPORT_GROUPS, LIVE_PROVIDERS, PROVIDER_KEY, type ReportKey } from "@/lib/integrations/reports";
import { startConnect, disconnectReport } from "@/lib/integration-actions";
import { ConnectMenu } from "./integrations/connect-menu";
import { StripeQbrPreview, StripeQbrPreviewSkeleton } from "./integrations/stripe-qbr-preview";
import { HubspotQbrPreview } from "./integrations/hubspot-qbr-preview";

type ProviderKey = "stripe" | "hubspot";

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

type Conn = {
  accountId: string;
  displayName: string | null;
  externalAccountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
};
type OrgAccount = { id: string; displayName: string | null; externalAccountId: string };

type Props = {
  orgPresent: boolean;
  isAdmin: boolean;
  orgAccountsByProvider: Record<ProviderKey, OrgAccount[]>;
  connectionsByReport: Partial<Record<ReportKey, Partial<Record<ProviderKey, Conn>>>>;
};

export function IntegrationsTab({
  orgPresent,
  isAdmin,
  orgAccountsByProvider,
  connectionsByReport,
}: Props) {
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
              ? "Connect a source to start pulling live data into each report. Stripe and HubSpot are live; more are coming soon."
              : "Only org admins can manage connections. Stripe and HubSpot are live; more are coming soon."}
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {REPORT_GROUPS.map((group) => {
          const conns = connectionsByReport[group.key] ?? {};
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
                  const providerKey = PROVIDER_KEY[name];
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

                      {isLive && providerKey ? (
                        <ProviderControl
                          provider={providerKey}
                          reportKey={group.key}
                          conn={conns[providerKey]}
                          orgPresent={orgPresent}
                          isAdmin={isAdmin}
                          accounts={orgAccountsByProvider[providerKey]}
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

              {group.key === "qbr" && conns.stripe ? (
                <PreviewDisclosure label="View live Stripe data">
                  <Suspense fallback={<StripeQbrPreviewSkeleton />}>
                    <StripeQbrPreview stripeAccountId={conns.stripe.externalAccountId} />
                  </Suspense>
                </PreviewDisclosure>
              ) : null}

              {group.key === "qbr" && conns.hubspot ? (
                <PreviewDisclosure label="View live HubSpot data">
                  <Suspense fallback={<StripeQbrPreviewSkeleton />}>
                    <HubspotQbrPreview
                      account={{
                        id: conns.hubspot.accountId,
                        accessToken: conns.hubspot.accessToken,
                        refreshToken: conns.hubspot.refreshToken,
                        tokenExpiresAt: conns.hubspot.tokenExpiresAt,
                      }}
                    />
                  </Suspense>
                </PreviewDisclosure>
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

// Collapsible wrapper so live data panels stay opt-in and don't clutter the
// page. Native <details> — collapsed by default, no client JS.
function PreviewDisclosure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group mt-3">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-accent-500 transition hover:text-accent-400 [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-3 transition group-open:rotate-90"
          aria-hidden
        >
          <path d="M6 4l4 4-4 4V4z" />
        </svg>
        {label}
      </summary>
      {children}
    </details>
  );
}

function ProviderControl({
  provider,
  reportKey,
  conn,
  orgPresent,
  isAdmin,
  accounts,
}: {
  provider: ProviderKey;
  reportKey: ReportKey;
  conn: Conn | undefined;
  orgPresent: boolean;
  isAdmin: boolean;
  accounts: OrgAccount[];
}) {
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
            <input type="hidden" name="provider" value={provider} />
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

  if (accounts.length > 0) {
    return <ConnectMenu provider={provider} reportKey={reportKey} accounts={accounts} />;
  }

  return (
    <form action={startConnect} className="shrink-0">
      <input type="hidden" name="provider" value={provider} />
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
