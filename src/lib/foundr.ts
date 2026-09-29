/* ------------------------------------------------------------------ *
 * FoundrMatch domain model
 * Founder profiles, smart filters, onboarding state, the
 * natural-language bio parser and the vision-synergy engine.
 * ------------------------------------------------------------------ */

/* ------------------------------- types ------------------------------- */

export type Stage = "Idea" | "Pre-seed" | "Seed" | "Series A";
export type TimeCommitment = "Full-time" | "Part-time (nights & weekends)";
export type EquityExpectation = "Equal split" | "Majority founder" | "Flexible / negotiable";
export type WorkStyle = "Deep maker time" | "Ship fast & iterate" | "Structured & process-driven";
export type LookingFor = "Technical Co-Founder" | "Commercial Co-Founder";
export type RadarAxis = "Tech" | "Product" | "Growth" | "Ops";

export type FounderProfile = {
  id: string;
  name: string;
  title: string;
  location: string;
  remoteFriendly: boolean;
  avatarHue: number;
  verified: boolean;
  headline: string;
  pitch: string;
  stage: Stage;
  commitment: TimeCommitment;
  equity: EquityExpectation;
  workStyle: WorkStyle;
  industries: string[];
  stack: string[];
  lookingFor: LookingFor;
  radar: Record<RadarAxis, number>;
  notable: string[];
  responseTime: string;
};

/* --------------------------- dummy profiles --------------------------- */
/* Four distinct founders, including the requested AI/ML engineer
   seeking a B2B SaaS growth lead. */

export const FOUNDERS: FounderProfile[] = [
  {
    id: "maya",
    name: "Maya Okafor",
    title: "AI/ML Engineer · ex-DeepMind",
    location: "London, UK",
    remoteFriendly: true,
    avatarHue: 262,
    verified: true,
    headline: "Building the AI copilot for clinical trials",
    pitch:
      "I'm building an LLM copilot that drafts and quality-checks clinical-trial protocols in hours instead of months. Two pilot CROs signed; looking for a commercial partner who can own GTM while I own model depth.",
    stage: "Pre-seed",
    commitment: "Full-time",
    equity: "Equal split",
    workStyle: "Deep maker time",
    industries: ["AI / ML", "HealthTech"],
    stack: ["PyTorch", "LLMOps", "Python", "TypeScript"],
    lookingFor: "Commercial Co-Founder",
    radar: { Tech: 96, Product: 58, Growth: 34, Ops: 52 },
    notable: ["6 yrs applied ML", "2 pilot customers", "PhD, UCL"],
    responseTime: "Usually replies in ~2h",
  },
  {
    id: "dario",
    name: "Dario Venn",
    title: "B2B SaaS Growth Lead · 3× first GTM hire",
    location: "Amsterdam, NL",
    remoteFriendly: true,
    avatarHue: 160,
    verified: true,
    headline: "Turning technical products into revenue machines",
    pitch:
      "I've taken three dev-tool companies from $0 to $1.2M ARR as founding GTM. I want to co-found in applied AI — I'll own positioning, pipeline and pricing if you own the product you can't stop building.",
    stage: "Seed",
    commitment: "Full-time",
    equity: "Equal split",
    workStyle: "Ship fast & iterate",
    industries: ["AI / ML", "DevTools"],
    stack: ["Sales-led GTM", "PLG", "HubSpot", "SQL", "Pricing"],
    lookingFor: "Technical Co-Founder",
    radar: { Tech: 28, Product: 62, Growth: 94, Ops: 66 },
    notable: ["$0 → $1.2M ARR ×3", "120+ discovery calls/wk", "Forbes 30U30 (2023)"],
    responseTime: "Usually replies in ~15m",
  },
  {
    id: "priya",
    name: "Priya Raghavan",
    title: "Product Designer & Frontend · ex-Stripe",
    location: "Bengaluru, IN",
    remoteFriendly: true,
    avatarHue: 24,
    verified: true,
    headline: "Design-partner for a fintech that feels effortless",
    pitch:
      "Five years designing payment infrastructure UIs at Stripe. I want to co-found where design *is* the product edge — a fintech or dev-tool with brutal simplicity. Equal equity, full-time, from day zero.",
    stage: "Idea",
    commitment: "Full-time",
    equity: "Equal split",
    workStyle: "Structured & process-driven",
    industries: ["FinTech", "DevTools"],
    stack: ["Design Systems", "React", "TypeScript", "Framer", "User Research"],
    lookingFor: "Technical Co-Founder",
    radar: { Tech: 64, Product: 92, Growth: 48, Ops: 58 },
    notable: ["Stripe Payments UI", "Dribbble 1.2M views", "a11y specialist"],
    responseTime: "Usually replies in ~4h",
  },
  {
    id: "tomás",
    name: "Tomás Rivera",
    title: "Ops & Supply Chain · scaled 2 marketplaces",
    location: "Austin, TX",
    remoteFriendly: false,
    avatarHue: 200,
    verified: false,
    headline: "Operational backbone for a logistics marketplace",
    pitch:
      "I ran ops for a 40-city last-mile marketplace through Series B. I sweat vendor SLAs, unit economics and the boring spreadsheets that decide survival. Seeking a technical or product co-founder in logistics or climate.",
    stage: "Seed",
    commitment: "Part-time (nights & weekends)",
    equity: "Flexible / negotiable",
    workStyle: "Structured & process-driven",
    industries: ["Logistics", "Climate"],
    stack: ["Unit Economics", "S&OP", "SQL", "Flexport API", "Notion"],
    lookingFor: "Technical Co-Founder",
    radar: { Tech: 18, Product: 46, Growth: 55, Ops: 97 },
    notable: ["40-city launch", "Series B ops", "6-sigma black belt"],
    responseTime: "Usually replies in ~1d",
  },
];

/* ------------------------- filter bar options ------------------------- */

export const INDUSTRIES = [
  "AI / ML",
  "FinTech",
  "HealthTech",
  "DevTools",
  "Climate",
  "Logistics",
] as const;

export const STACKS = [
  "PyTorch",
  "LLMOps",
  "Python",
  "TypeScript",
  "React",
  "Sales-led GTM",
  "PLG",
  "Design Systems",
  "SQL",
  "Unit Economics",
] as const;

export type Filters = {
  industry: string;
  stack: string;
  geo: string;
  stage: string;
  equity: string;
};

export const EMPTY_FILTERS: Filters = {
  industry: "",
  stack: "",
  geo: "",
  stage: "",
  equity: "",
};

export function applyFilters(list: FounderProfile[], f: Filters): FounderProfile[] {
  return list.filter(
    (p) =>
      (!f.industry || p.industries.includes(f.industry)) &&
      (!f.stack || p.stack.includes(f.stack)) &&
      (!f.stage || p.stage === f.stage) &&
      (!f.equity || p.equity === f.equity) &&
      (!f.geo ||
        p.remoteFriendly ||
        p.location.toLowerCase().includes(f.geo.toLowerCase().split(",")[0].trim())),
  );
}

/* ----------------------------- onboarding ----------------------------- */

export type Onboarding = {
  vision: string;
  stage: Stage;
  industries: string[];
  gaps: string[];
  commitment: TimeCommitment;
  equity: EquityExpectation;
  workStyle: WorkStyle;
  lookingFor: LookingFor;
};

export const DEFAULT_ONBOARDING: Onboarding = {
  vision: "",
  stage: "Idea",
  industries: [],
  gaps: [],
  commitment: "Full-time",
  equity: "Equal split",
  workStyle: "Ship fast & iterate",
  lookingFor: "Technical Co-Founder",
};

/* --------------------------- AI bio parser --------------------------- */
/* Simulates the "paste your LinkedIn" NL parser. Deterministic keyword
   heuristics keep it offline-friendly; an LLM action can replace it later. */

export type ParsedBio = {
  detectedSkills: string[];
  suggestedIndustries: string[];
  suggestedStage: Stage;
  suggestedCommitment: TimeCommitment;
  suggestedEquity: EquityExpectation;
  radar: Record<RadarAxis, number>;
  dominant: RadarAxis;
  summary: string;
};

const SKILL_RULES: Array<[RegExp, string]> = [
  [/\bml\b|machine learning|deep learning|llm|ai\b|pytorch|tensorflow/i, "PyTorch"],
  [/\bnlp\b|llmops|prompt/i, "LLMOps"],
  [/\bpython\b/i, "Python"],
  [/typescript|\breact\b|frontend|front-end/i, "TypeScript"],
  [/\breact\b/i, "React"],
  [/design|ux|figma/i, "Design Systems"],
  [/growth|gtm|marketing|demand gen/i, "Sales-led GTM"],
  [/product-led|plg/i, "PLG"],
  [/sql|analytics|data/i, "SQL"],
  [/ops|operations|supply chain|logistics/i, "Unit Economics"],
];

const INDUSTRY_RULES: Array<[RegExp, string]> = [
  [/\bai\b|machine learning|llm/i, "AI / ML"],
  [/fintech|payments|banking/i, "FinTech"],
  [/health|clinic|bio|med/i, "HealthTech"],
  [/devtools?|developer|infrastructure|api/i, "DevTools"],
  [/climate|carbon|energy|sustain/i, "Climate"],
  [/logistics|supply|marketplace|shipping/i, "Logistics"],
];

function rank(rules: Array<[RegExp, string]>, text: string): string[] {
  const hits: Array<{ key: string; at: number }> = [];
  for (const [re, key] of rules) {
    const m = text.match(re);
    if (m && m.index !== undefined) hits.push({ key, at: m.index });
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => h.key).filter((k, i, a) => a.indexOf(k) === i);
}

export function parseBio(raw: string): ParsedBio {
  const text = raw.toLowerCase();
  const detectedSkills = rank(SKILL_RULES, text);
  const suggestedIndustries = rank(INDUSTRY_RULES, text);

  const stage: Stage = /\bseries a\b/i.test(raw)
    ? "Series A"
    : /\bseed\b/i.test(raw)
      ? "Seed"
      : /\bpre-?seed\b|mvp\b|prototype\b/i.test(raw)
        ? "Pre-seed"
        : /\bidea\b|exploring\b|looking for/i.test(raw)
          ? "Idea"
          : "Idea";

  const suggestedCommitment: TimeCommitment =
    /part-?time|nights|weekends|side project|evenings/i.test(raw)
      ? "Part-time (nights & weekends)"
      : "Full-time";

  const suggestedEquity: EquityExpectation = /equal|50\/50|even split/i.test(raw)
    ? "Equal split"
    : /majority|controlling|60|70/i.test(raw)
      ? "Majority founder"
      : /flexible|negotiable|open/i.test(raw)
        ? "Flexible / negotiable"
        : "Equal split";

  const radar: Record<RadarAxis, number> = { Tech: 30, Product: 40, Growth: 30, Ops: 30 };
  const bump = (axis: RadarAxis, n: number, cap = 95) => {
    radar[axis] = Math.min(cap, radar[axis] + n);
  };
  if (/engineer|developer|pytorch|llm|ml\b|backend|full-?stack|typescript|python/i.test(text))
    bump("Tech", 55);
  if (/design|product|ux|roadmap|user research|frontend/i.test(text)) bump("Product", 45);
  if (/growth|gtm|sales|marketing|arr|pipeline|revenue/i.test(text)) bump("Growth", 55);
  if (/ops|operations|supply|logistics|process|finance/i.test(text)) bump("Ops", 50);
  if (/co-?found|founder|startup/i.test(text)) {
    bump("Product", 8);
    bump("Growth", 8);
  }

  const dominant = (Object.entries(radar).sort((a, b) => b[1] - a[1])[0][0]) as RadarAxis;

  const summary = `Mapped ${detectedSkills.length || "core"} skill${detectedSkills.length === 1 ? "" : "s"}${
    suggestedIndustries.length ? ` in ${suggestedIndustries.slice(0, 2).join(" × ")}` : ""
  }. Strongest signal: ${dominant}. ${suggestedCommitment} pace, ${suggestedEquity.toLowerCase()} equity.`;

  return {
    detectedSkills: detectedSkills.slice(0, 6),
    suggestedIndustries: suggestedIndustries.slice(0, 3),
    suggestedStage: stage,
    suggestedCommitment,
    suggestedEquity,
    radar,
    dominant,
    summary,
  };
}

/* ------------------------- vision synergy engine ------------------------- */

export type SynergyFactor = {
  label: string;
  score: number;
  detail: string;
};

export type Synergy = {
  overall: number;
  visionAlignment: number;
  factors: SynergyFactor[];
  headline: string;
};

const clamp = (n: number) => Math.max(38, Math.min(99, Math.round(n)));

export function computeSynergy(
  me: Pick<Onboarding, "stage" | "commitment" | "equity" | "workStyle" | "lookingFor" | "industries">,
  them: FounderProfile,
): Synergy {
  const stageFit =
    me.stage === them.stage ? 96 : me.stage === "Idea" && them.stage === "Pre-seed" ? 88 : 74;

  const commitmentFit = me.commitment === them.commitment ? 97 : 55;
  const equityFit = me.equity === them.equity ? 94 : me.equity === "Flexible / negotiable" || them.equity === "Flexible / negotiable" ? 82 : 64;
  const styleFit =
    me.workStyle === them.workStyle ? 92 : Math.abs(workStyleIndex(me.workStyle) - workStyleIndex(them.workStyle)) === 1 ? 78 : 66;
  const industryFit =
    me.industries.length === 0 || them.industries.some((i) => me.industries.includes(i)) ? 90 : 71;

  const intentScore = intentFitFor(me, them);

  const visionAlignment = clamp(stageFit * 0.34 + industryFit * 0.4 + intentScore * 0.26);
  const factors: SynergyFactor[] = [
    {
      label: "Complementary Skills",
      score: intentScore,
      detail:
        intentScore >= 90
          ? `You need ${them.lookingFor.toLowerCase()}s — ${them.name.split(" ")[0]} is one.`
          : intentScore >= 72
            ? "Partial overlap; some skill redundancy."
            : "You're both hunting for the same co-founder role.",
    },
    {
      label: "Working Style",
      score: styleFit,
      detail:
        styleFit >= 90
          ? `You both default to "${them.workStyle}".`
          : styleFit >= 78
            ? "Adjacent styles — bridgeable with rituals."
            : "Different operating rhythms worth discussing early.",
    },
    {
      label: "Vision Alignment",
      score: visionAlignment,
      detail:
        visionAlignment >= 90
          ? "Stage, industry and role intent line up almost perfectly."
          : visionAlignment >= 78
            ? "Strong overlap with a few deltas to align on."
            : "Direction matches; details need a whiteboard.",
    },
    {
      label: "Commitment & Equity",
      score: clamp(commitmentFit * 0.6 + equityFit * 0.4),
      detail:
        commitmentFit >= 90 && equityFit >= 90
          ? `${them.commitment} · ${them.equity}`
          : "Time or equity expectations differ — talk now, not later.",
    },
    {
      label: "Industry Overlap",
      score: industryFit,
      detail:
        industryFit >= 90
          ? `Shared ground in ${them.industries.join(" & ")}.`
          : "Different domain; adjacency is plausible.",
    },
  ];

  const overall = clamp(
    visionAlignment * 0.34 +
      intentScore * 0.24 +
      styleFit * 0.14 +
      clamp(commitmentFit * 0.6 + equityFit * 0.4) * 0.16 +
      industryFit * 0.12,
  );

  const headline =
    overall >= 90
      ? "Rare alignment — book the coffee chat today."
      : overall >= 78
        ? "Strong signal — worth a first conversation."
        : "Curious mismatch — could complement in unexpected ways.";

  return { overall, visionAlignment, factors, headline };
}

function workStyleIndex(s: WorkStyle): number {
  return s === "Deep maker time" ? 0 : s === "Ship fast & iterate" ? 1 : 2;
}

/** "Looking for" complementarity: opposite intent = perfect fit. */
function intentFitFor(
  me: Pick<Onboarding, "lookingFor">,
  them: FounderProfile,
): number {
  const meWantsTech = me.lookingFor === "Technical Co-Founder";
  const themIsTech = them.radar.Tech >= 60;
  if (meWantsTech && themIsTech) return 98;
  if (!meWantsTech && !themIsTech) return 58; // both non-technical → same gap
  return 76; // partial complementarity
}
