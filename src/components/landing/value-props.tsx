import { Reveal } from "@/components/motion/reveal";

const props = [
  {
    eyebrow: "Curated, not generated",
    title: "Decks built by people who present for a living.",
    body: "Every template solves a specific business problem — pitches, QBRs, monthly close, postmortems. No fillers, no lorem ipsum.",
  },
  {
    eyebrow: "Premium by default",
    title: "Confident typography, restrained motion, real layouts.",
    body: "Tokens for color, type, and spacing keep every slide on-brand. The design holds up on a 13\" laptop and a boardroom projector.",
  },
  {
    eyebrow: "One click to open",
    title: "Templates are full apps. We just hand you the keys.",
    body: "Each template is deployed as its own Next.js app. Click Open and you're editing — no import, no install, no migration.",
  },
];

export function ValueProps() {
  return (
    <section className="border-t border-white/5 bg-ink-900/85">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
        <Reveal as="div" className="max-w-2xl" stagger>
          <p
            data-reveal
            className="text-xs font-medium uppercase tracking-wider text-accent-500"
          >
            Why DeckForge
          </p>
          <h2
            data-reveal
            className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          >
            The deck library for people who care about the work.
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
              className="rounded-2xl border border-white/10 bg-ink-900 p-6 transition hover:bg-ink-800"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-brand-300">
                {p.eyebrow}
              </p>
              <h3 className="mt-3 text-lg font-medium text-white">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-200">{p.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
