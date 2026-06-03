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

type Integration = { icon: { path: string }; name: string };

type ReportGroup = {
  report: string;
  description: string;
  integrations: Integration[];
};

const groups: ReportGroup[] = [
  {
    report: "Quarterly Business Review",
    description: "Revenue performance, pipeline health, product usage, and engineering output in one narrative.",
    integrations: [
      { icon: siStripe,          name: "Stripe" },
      { icon: siHubspot,         name: "HubSpot" },
      { icon: siGoogleanalytics, name: "Google Analytics" },
      { icon: siPosthog,         name: "PostHog" },
      { icon: siLinear,          name: "Linear" },
      { icon: siDatadog,         name: "Datadog" },
    ],
  },
  {
    report: "Investor Update",
    description: "MRR growth, user traction, pipeline, and key milestones formatted for investors.",
    integrations: [
      { icon: siStripe,    name: "Stripe" },
      { icon: siHubspot,   name: "HubSpot" },
      { icon: siMixpanel,  name: "Mixpanel" },
      { icon: siGithub,    name: "GitHub" },
      { icon: siSnowflake, name: "Snowflake" },
    ],
  },
  {
    report: "Revenue Report",
    description: "Closed revenue, pipeline conversion, customer support load, and e-commerce performance.",
    integrations: [
      { icon: siStripe,   name: "Stripe" },
      { icon: siHubspot,  name: "HubSpot" },
      { icon: siShopify,  name: "Shopify" },
      { icon: siIntercom, name: "Intercom" },
      { icon: siZendesk,  name: "Zendesk" },
    ],
  },
  {
    report: "FP&A Monthly Close",
    description: "P&L summary, variance analysis, and forward look pulled from your accounting and data stack.",
    integrations: [
      { icon: siQuickbooks,     name: "QuickBooks" },
      { icon: siXero,           name: "Xero" },
      { icon: siStripe,         name: "Stripe" },
      { icon: siGooglebigquery, name: "BigQuery" },
      { icon: siPostgresql,     name: "PostgreSQL" },
    ],
  },
  {
    report: "Product & Growth",
    description: "Activation, retention, funnel performance, and experiment results from your analytics tools.",
    integrations: [
      { icon: siPosthog,         name: "PostHog" },
      { icon: siMixpanel,        name: "Mixpanel" },
      { icon: siGoogleanalytics, name: "Google Analytics" },
      { icon: siLooker,          name: "Looker" },
      { icon: siAirtable,        name: "Airtable" },
    ],
  },
  {
    report: "Ops & Engineering",
    description: "Incident timelines, deployment frequency, sprint velocity, and infrastructure health.",
    integrations: [
      { icon: siDatadog,    name: "Datadog" },
      { icon: siGithub,     name: "GitHub" },
      { icon: siLinear,     name: "Linear" },
      { icon: siJira,       name: "Jira" },
      { icon: siAsana,      name: "Asana" },
      { icon: siMongodb,    name: "MongoDB" },
      { icon: siNotion,     name: "Notion" },
    ],
  },
];

export function IntegrationsTab() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-white light:text-ink-900">
          Integrations by report
        </h2>
        <p className="mt-1 text-sm text-ink-300 light:text-ink-500">
          Each report type pulls from the tools your team already uses. Connections are coming soon.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {groups.map((group) => (
          <li
            key={group.report}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-brand-700/15 via-ink-900 to-ink-900 p-5 shadow-lift light:border-ink-900/10 light:from-brand-50 light:via-white light:to-white"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white light:text-ink-900">
                  {group.report}
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-400 light:text-ink-500">
                  {group.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-400 light:border-ink-900/10 light:bg-ink-100 light:text-ink-500">
                Coming soon
              </span>
            </div>

            <ul className="mt-4 divide-y divide-white/[0.06] light:divide-ink-900/8">
              {group.integrations.map((integration) => (
                <li
                  key={integration.name}
                  className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] light:border-ink-900/10 light:bg-ink-50">
                      <svg
                        viewBox="0 0 24 24"
                        width={13}
                        height={13}
                        fill="currentColor"
                        className="text-white/60 light:text-ink-500"
                        aria-hidden
                      >
                        <path d={integration.icon.path} />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-white light:text-ink-900">
                      {integration.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled
                    className="shrink-0 cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-400 opacity-50 light:border-ink-900/10 light:bg-ink-50 light:text-ink-500"
                  >
                    Connect
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
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
