import { Reveal } from "@/components/motion/reveal";

const props = [
  {
    eyebrow: "Live data integrations",
    title: "Connect the tools your company already uses.",
    body: "Stripe, HubSpot, Notion, Slack, Linear, and more — your data flows in automatically. No manual exports, no copy-paste metrics before every meeting.",
  },
  {
    eyebrow: "Auto-generated narratives",
    title: "Executive-ready decks from your live operational data.",
    body: "Revenue metrics, pipeline updates, operational insights — synthesised into structured presentations with executive-level storytelling, built for the room you're walking into.",
  },
  {
    eyebrow: "Cinematic and fully editable",
    title: "Web-native presentations your team can still customise.",
    body: "Built with GSAP for fluid motion and pixel-perfect layouts. Every generated slide stays fully editable — rearrange, rewrite, refine without touching code.",
  },
];

export function ValueProps() {
  return (
    <section className="border-t border-white/5 bg-ink-900/85 light:border-ink-900/8 light:bg-[#f5f5f5]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal as="div" className="max-w-2xl" stagger>
          <p
            data-reveal
            className="text-xs font-medium uppercase tracking-wider text-accent-500"
          >
            How it works
          </p>
          <h2
            data-reveal
            className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl light:text-ink-900"
          >
            A living presentation system for modern companies.
          </h2>
        </Reveal>

        <Reveal
          as="ul"
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          stagger
        >
          {props.map((p) => (
            <li
              key={p.eyebrow}
              data-reveal
              className="rounded-2xl border border-white/10 bg-ink-900 p-6 transition hover:bg-ink-800 light:border-ink-900/10 light:bg-white light:hover:bg-ink-50"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-brand-300 light:text-brand-600">
                {p.eyebrow}
              </p>
              <h3 className="mt-3 text-lg font-medium text-white light:text-ink-900">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-200 light:text-ink-600">{p.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
