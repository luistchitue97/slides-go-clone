const integrations = [
  // Payments & Revenue
  "Stripe", "QuickBooks", "Xero", "NetSuite",
  // CRM
  "Salesforce", "HubSpot",
  // Communication & Support
  "Slack", "Intercom", "Zendesk",
  // Project & Ops
  "Linear", "Jira", "Asana", "Notion",
  // Analytics
  "Google Analytics", "PostHog", "Mixpanel", "Amplitude",
  // Data & Infra
  "Snowflake", "BigQuery", "PostgreSQL",
  // Engineering
  "GitHub", "Airtable",
];

// Duplicate for seamless infinite loop — translateX(-50%) lands exactly at the start.
const allItems = [...integrations, ...integrations];

export function IntegrationTicker() {
  return (
    <section className="border-t border-white/5 bg-ink-900/50 py-6">
      <p className="mb-5 text-center text-[11px] font-medium uppercase tracking-widest text-white/25">
        Connects with your stack
      </p>

      <div className="relative overflow-hidden">
        {/* Gradient fade masks */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#080b1c] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#080b1c] to-transparent"
        />

        <ul aria-hidden className="animate-ticker flex whitespace-nowrap">
          {allItems.map((name, i) => (
            <li key={i} className="mx-7 shrink-0 text-sm font-medium text-white/35">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
