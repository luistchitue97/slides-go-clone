import {
  siStripe,
  siHubspot,
  siIntercom,
  siZendesk,
  siNotion,
  siLinear,
  siAsana,
  siJira,
  siGithub,
  siAirtable,
  siShopify,
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

type BrandIcon = { title: string; path: string };

const integrations: BrandIcon[] = [
  siStripe,
  siHubspot,
  siIntercom,
  siZendesk,
  siNotion,
  siLinear,
  siAsana,
  siJira,
  siGithub,
  siAirtable,
  siShopify,
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
];

// Duplicate for seamless loop — translateX(-50%) returns to exact start.
const allItems = [...integrations, ...integrations];

export function IntegrationTicker() {
  return (
    <section className="border-t border-white/5 bg-ink-950 py-8">
      <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-widest text-white/25">
        Connects with your stack
      </p>

      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-ink-950 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-ink-950 to-transparent"
        />

        <ul aria-hidden className="animate-ticker flex items-center gap-4 py-1">
          {allItems.map((icon, i) => (
            <li
              key={i}
              className="flex shrink-0 items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-white/45"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden>
                <path d={icon.path} />
              </svg>
              <span className="text-sm font-medium">{icon.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
