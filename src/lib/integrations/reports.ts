// Report → data-source mapping, shared between the Integrations UI and the
// connection backend. `reportKey` is the stable identifier we persist in
// report_connections; the `name` strings match provider labels used for icons.

export type ReportKey =
  | "qbr"
  | "investor-update"
  | "revenue"
  | "fpa"
  | "product-growth"
  | "ops-eng";

// Providers that are actually wired up today. Everything else renders as a
// disabled "coming soon" row.
export const LIVE_PROVIDERS = new Set<string>(["Stripe"]);

export type ReportGroup = {
  key: ReportKey;
  report: string;
  description: string;
  /** Provider display names; icons resolved in the UI via a name→icon map. */
  integrations: string[];
};

export const REPORT_GROUPS: ReportGroup[] = [
  {
    key: "qbr",
    report: "Quarterly Business Review",
    description:
      "Revenue performance, pipeline health, product usage, and engineering output in one narrative.",
    integrations: ["Stripe", "HubSpot", "Google Analytics", "PostHog", "Linear", "Datadog"],
  },
  {
    key: "investor-update",
    report: "Investor Update",
    description: "MRR growth, user traction, pipeline, and key milestones formatted for investors.",
    integrations: ["Stripe", "HubSpot", "Mixpanel", "GitHub", "Snowflake"],
  },
  {
    key: "revenue",
    report: "Revenue Report",
    description:
      "Closed revenue, pipeline conversion, customer support load, and e-commerce performance.",
    integrations: ["Stripe", "HubSpot", "Shopify", "Intercom", "Zendesk"],
  },
  {
    key: "fpa",
    report: "FP&A Monthly Close",
    description:
      "P&L summary, variance analysis, and forward look pulled from your accounting and data stack.",
    integrations: ["QuickBooks", "Xero", "Stripe", "BigQuery", "PostgreSQL"],
  },
  {
    key: "product-growth",
    report: "Product & Growth",
    description:
      "Activation, retention, funnel performance, and experiment results from your analytics tools.",
    integrations: ["PostHog", "Mixpanel", "Google Analytics", "Looker", "Airtable"],
  },
  {
    key: "ops-eng",
    report: "Ops & Engineering",
    description:
      "Incident timelines, deployment frequency, sprint velocity, and infrastructure health.",
    integrations: ["Datadog", "GitHub", "Linear", "Jira", "Asana", "MongoDB", "Notion"],
  },
];

const VALID_KEYS = new Set<string>(REPORT_GROUPS.map((g) => g.key));

export function isReportKey(value: unknown): value is ReportKey {
  return typeof value === "string" && VALID_KEYS.has(value);
}
