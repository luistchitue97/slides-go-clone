import type { Template } from "@/types/template";

// Order in this array drives two things:
//   1. The default newest-first sort on /reports (also derivable from
//      publishedAt — kept here for stability when dates collide).
//   2. The per-template env-var mapping in getTemplateOrderUrl
//      (NEXT_PUBLIC_TEMPLATE_ONE_URL → index 0, _TWO_URL → index 1, …).
// Reordering this file shifts the env-var-to-template assignments — keep
// .env.example in sync.
export const templates: Template[] = [
  {
    slug: "series-a-data-room",
    title: "Quarterly Business Review",
    category: "management",
    tags: ["qbr", "exec", "reporting"],
    shortDescription: "Executive QBR deck with KPI dashboards and a tight narrative arc.",
    longDescription:
      "Every section has a job: context, scorecard, wins, losses, asks. Tables and charts are pre-styled so updating the numbers never breaks the look. Built for leadership teams who run lean, high-stakes quarterly reviews.",
    thumbnailUrl: "/templates/placeholder-data-room.svg",
    launchUrl: "https://example.com/templates/series-a-data-room",
    aspectRatio: "16:9",
    isNew: true,
    publishedAt: "2026-05-18",
  },
  {
    slug: "north-star-pitch",
    title: "SaaS Pitch",
    category: "sales",
    tags: ["pitch", "saas", "fundraising"],
    shortDescription: "A sharp SaaS pitch deck built for founders who move fast.",
    longDescription:
      "Covers the ten slides every SaaS investor expects: problem, solution, traction, unit economics, team, and ask. Cinematic typography and quiet motion — designed to hold the room on a 13\" laptop and a boardroom projector alike.",
    thumbnailUrl: "/templates/placeholder-north-star.svg",
    launchUrl: "https://example.com/templates/north-star-pitch",
    aspectRatio: "16:9",
    isNew: true,
    publishedAt: "2026-05-10",
  },
  {
    slug: "quarterly-business-review",
    title: "Seed Pitch",
    category: "investing",
    tags: ["pitch", "seed", "fundraising"],
    shortDescription: "A focused seed-round pitch that earns the next meeting.",
    longDescription:
      "Built around the questions every seed investor asks: why now, why you, what's the size. Pre-styled slides for traction, market, and the ask — so the story lands before the appendix begins.",
    thumbnailUrl: "/templates/template-03.png",
    launchUrl: "https://example.com/templates/quarterly-business-review",
    aspectRatio: "16:9",
    publishedAt: "2026-04-22",
  },
  {
    slug: "people-all-hands",
    title: "Strategy Planner",
    category: "management",
    tags: ["strategy", "planning", "roadmap"],
    shortDescription: "A clear-eyed strategy deck that aligns the team on what matters.",
    longDescription:
      "Frames the big picture without losing the detail: mission, bets, priorities, and the metrics that will tell you if you're winning. Built for leadership offsites and board-level strategy reviews.",
    thumbnailUrl: "/templates/placeholder-all-hands.svg",
    launchUrl: "https://example.com/templates/people-all-hands",
    aspectRatio: "16:9",
    publishedAt: "2026-04-02",
  },
  {
    slug: "revenue-playbook",
    title: "Revenue Playbook",
    category: "sales",
    tags: ["playbook", "enablement", "process"],
    shortDescription: "Sales enablement playbook with ICP, plays, and a discovery framework.",
    longDescription:
      "Designed with sales leaders, Revenue Playbook keeps reps oriented across territories. Each play has a single slide with the trigger, the move, and the proof.",
    thumbnailUrl: "/templates/placeholder-revenue.svg",
    launchUrl: "https://example.com/templates/revenue-playbook",
    aspectRatio: "16:9",
    publishedAt: "2026-03-30",
  },
  {
    slug: "growth-experiment-report",
    title: "Growth Experiment Report",
    category: "marketing",
    tags: ["growth", "experiments", "analytics"],
    shortDescription: "Report on growth experiments without burying the lede.",
    longDescription:
      "Pre-built layouts for hypothesis, result, and decision. Designed so a skim reader leaves with the punchline and a careful reader leaves with the evidence.",
    thumbnailUrl: "/templates/placeholder-growth.svg",
    launchUrl: "https://example.com/templates/growth-experiment-report",
    aspectRatio: "16:9",
    publishedAt: "2026-03-12",
  },
  {
    slug: "fp-and-a-monthly-close",
    title: "FP&A Monthly Close",
    category: "finance",
    tags: ["finance", "close", "reporting"],
    shortDescription: "Crisp monthly-close deck with variance commentary and forward look.",
    longDescription:
      "Built around the four questions every CFO asks at close: what happened, why, what changed, what's next. Tables read well even when projected.",
    thumbnailUrl: "/templates/placeholder-fpa.svg",
    launchUrl: "https://example.com/templates/fp-and-a-monthly-close",
    aspectRatio: "16:9",
    publishedAt: "2026-02-14",
  },
  {
    slug: "ops-incident-review",
    title: "Ops Incident Review",
    category: "ops",
    tags: ["incident", "postmortem", "reliability"],
    shortDescription: "Blameless postmortem deck with a clear timeline and follow-ups.",
    longDescription:
      "Keeps incident reviews on the rails: timeline, contributing factors, customer impact, what we'll change. Tuned for engineering and ops audiences.",
    thumbnailUrl: "/templates/placeholder-incident.svg",
    launchUrl: "https://example.com/templates/ops-incident-review",
    aspectRatio: "16:9",
    publishedAt: "2026-01-09",
  },
];
