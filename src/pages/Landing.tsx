import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Coffee,
  FileText,
  Filter,
  Layers,
  Radar as RadarIcon,
  ShieldCheck,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FounderAvatar, GlassPanel, MonoTag, SectionHeading } from "@/components/foundr/GlassKit";
import { ScoreRing } from "@/components/foundr/ScoreRing";
import { MatchRadar, RadarLegend } from "@/components/foundr/MatchRadar";
import { FOUNDERS, parseBio, type FounderProfile, type Onboarding } from "@/lib/foundr";
import { cn } from "@/lib/utils";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function useLiveMatchCounter(start = 12_409) {
  const [count, setCount] = useState(start);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + 1 + Math.floor(Math.random() * 3)), 2600);
    return () => clearInterval(id);
  }, []);
  return count;
}

function startIntent(intent: "tech" | "commercial", navigate: ReturnType<typeof useNavigate>) {
  sessionStorage.setItem("foundr:intent", intent);
  navigate("/auth?returnTo=%2Fdashboard");
}

/* ================================================================== */
/*  Background                                                         */
/* ================================================================== */

function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden noise">
      <div className="absolute inset-0 glass-mesh" />
      <motion.div
        className="absolute -top-24 left-[8%] size-[28rem] rounded-full bg-[hsl(262_80%_70%)] opacity-25 blur-3xl"
        animate={{ y: [0, 40, 0], x: [0, 24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[30%] right-[4%] size-[22rem] rounded-full bg-[hsl(160_70%_60%)] opacity-20 blur-3xl"
        animate={{ y: [0, -36, 0], x: [0, -18, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[4%] left-[30%] size-[20rem] rounded-full bg-[hsl(200_80%_70%)] opacity-20 blur-3xl"
        animate={{ y: [0, 28, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ================================================================== */
/*  Nav                                                                */
/* ================================================================== */

function GlassNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <motion.nav
        initial={{ y: -32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-300",
          scrolled ? "glass-strong edge-top" : "glass-subtle",
        )}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(262_75%_58%)] to-[hsl(200_80%_55%)] text-white shadow-[0_4px_16px_-4px_rgba(99,102,241,0.6)]">
            <RadarIcon className="size-4.5" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            Founder Connect <span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#onboarding" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#features" className="transition-colors hover:text-foreground">Matching AI</a>
          <a href="#deck" className="transition-colors hover:text-foreground">Catalog</a>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/auth?returnTo=%2Fdashboard">Sign in</Link>
          </Button>
          <Button size="sm" className="rounded-xl" asChild>
            <Link to="/auth?returnTo=%2Fdashboard">
              Get matched <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </motion.nav>
    </header>
  );
}

/* ================================================================== */
/*  Hero                                                               */
/* ================================================================== */

function FloatingCard({
  founder,
  className,
  delay = 0,
  score,
}: {
  founder: FounderProfile;
  className?: string;
  delay?: number;
  score: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute z-10", className)}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + delay * 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <GlassPanel hover className="w-56 rounded-2xl p-3.5">
          <div className="flex items-center gap-2.5">
            <FounderAvatar name={founder.name} hue={founder.avatarHue} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate text-[13px] font-semibold">
                {founder.name}
                {founder.verified && <BadgeCheck className="size-3.5 shrink-0 text-primary" />}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{founder.location}</p>
            </div>
            <div className="ml-auto scale-[0.72]">
              <ScoreRing value={score} size={58} stroke={6} label="" />
            </div>
          </div>
          <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-4 text-muted-foreground">
            {founder.headline}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {founder.stack.slice(0, 2).map((s) => (
              <MonoTag key={s}>{s}</MonoTag>
            ))}
          </div>
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  const count = useLiveMatchCounter();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-36 sm:pt-44">
      <MeshBackground />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="glass-subtle inline-flex items-center gap-2 rounded-full py-1 pl-2 pr-3 text-xs font-medium"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="tabular font-mono text-foreground">{count.toLocaleString()}</span>
            <span className="text-muted-foreground">matches made this week</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.6rem]"
          >
            Find the Woz to your <span className="text-gradient">Jobs.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Founder Connect AI pairs you with co-founders who share your vision, culture and
            work ethic — scored on skills, values and timing, not just keywords. Browse the
            catalog, study the match math, and open a conversation when the numbers look right.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              className="group h-12 rounded-2xl px-5 text-[15px] shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]"
              onClick={() => startIntent("tech", navigate)}
            >
              <BrainCircuit className="size-4.5" />
              Find a Technical Co-Founder
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="              glass-subtle h-12 rounded-2xl border-white/10 px-5 text-[15px] font-medium hover:bg-white/10"
              onClick={() => startIntent("commercial", navigate)}
            >
              Find a Commercial Co-Founder
              <ArrowRight className="size-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          >
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Verified operators from
            <MonoTag>Stripe</MonoTag>
            <MonoTag>DeepMind</MonoTag>
            <MonoTag>Flexport</MonoTag>
            <MonoTag>Y Combinator</MonoTag>
          </motion.div>
        </div>

        {/* Floating deck */}
        <div className="relative mx-auto hidden h-[30rem] w-full max-w-md sm:block">
          <FloatingCard founder={FOUNDERS[0]} score={94} delay={0.15} className="left-0 top-6 z-20 rotate-[-4deg]" />
          <FloatingCard founder={FOUNDERS[1]} score={91} delay={0.3} className="right-0 top-40 z-30 rotate-[3deg]" />
          <FloatingCard founder={FOUNDERS[2]} score={88} delay={0.45} className="bottom-2 left-6 z-10 rotate-[2deg]" />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="glass-strong absolute right-6 top-2 z-40 flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-mono tabular">94% Vision Alignment</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Onboarding preview (interactive)                                   */
/* ================================================================== */

const PREVIEW_STEPS = ["Vision", "Stage", "Role gaps", "Commitment", "Values & Equity"] as const;

function OnboardingPreview() {
  const [step, setStep] = useState(0);
  const [bio, setBio] = useState(
    "ML engineer ex-DeepMind, building an LLM copilot for clinical trials. Pre-seed, full-time, open to equal split.",
  );
  const parsed = useMemo(() => parseBio(bio), [bio]);
  const [applied, setApplied] = useState(false);

  const apply = () => {
    setApplied(true);
    toast.success("Co-founder graph mapped — sign up to keep it.", {
      description: parsed.summary,
    });
  };

  return (
    <section id="onboarding" className="relative mx-auto w-full max-w-6xl px-4 py-24">
      <SectionHeading
        eyebrow="Onboarding"
        title={<>Built in 3 minutes. <span className="text-gradient">Matched in seconds.</span></>}
        sub="Tell our AI what you're building and where you're stuck. We map your co-founder graph — skills, stage, values, equity — before you swipe a single card."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Step card */}
        <GlassPanel strong className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-1.5">
            {PREVIEW_STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  i === step
                    ? "bg-gradient-to-r from-[hsl(262_75%_58%)] to-[hsl(160_70%_45%)]"
                    : i < step
                      ? "bg-primary/40"
                      : "bg-foreground/10",
                )}
                aria-label={`Step ${i + 1}: ${s}`}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Step {step + 1} of 5 · {PREVIEW_STEPS[step]}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.28 }}
              className="mt-5 min-h-44"
            >
              {step === 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Your vision, in two sentences</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    What future are you building toward? Blunt is better than polished.
                  </p>
                  <div className="glass-subtle mt-4 rounded-xl p-4 text-sm leading-6">
                    “Every clinical trial should start in days, not months — I'm building the
                    copilot that writes the protocol.”
                  </div>
                </div>
              )}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-semibold">Where are you now?</h3>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Idea", "Pre-seed", "Seed"].map((s, i) => (
                      <div
                        key={s}
                        className={cn(
                          "glass-subtle rounded-xl px-3 py-4 text-center text-sm font-medium",
                          i === 1 && "border-primary/50 bg-white/10 shadow-[0_0_0_3px_hsl(262_75%_58%/0.25)]",
                        )}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">We match you with founders at the same altitude.</p>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-semibold">What's your skill gap?</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["GTM & Sales", "Product Design", "Backend / AI", "Ops & Finance", "Fundraising"].map((g, i) => (
                      <span
                        key={g}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-sm font-medium",
                          i === 2
                            ? "bg-gradient-to-r from-[hsl(262_75%_58%)] to-[hsl(220_75%_58%)] text-white shadow-[0_6px_20px_-6px_rgba(99,102,241,0.7)]"
                            : "glass-subtle",
                        )}
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Your gaps define your matching weights.</p>
                </div>
              )}
              {step === 3 && (
                <div>
                  <h3 className="text-lg font-semibold">Time commitment</h3>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {["Full-time", "Part-time (nights & weekends)"].map((t, i) => (
                      <div
                        key={t}
                        className={cn(
                          "glass-subtle rounded-xl px-4 py-4 text-sm font-medium",
                          i === 0 && "border-primary/50 bg-white/10 shadow-[0_0_0_3px_hsl(262_75%_58%/0.25)]",
                        )}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Mixed commitment pairs are flagged before you chat.</p>
                </div>
              )}
              {step === 4 && (
                <div>
                  <h3 className="text-lg font-semibold">Values & equity expectations</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    {[
                      ["Equity", "Equal split"],
                      ["Work style", "Ship fast & iterate"],
                      ["Must-have value", "Radical candor"],
                    ].map(([k, v]) => (
                      <div key={k} className="glass-subtle flex items-center justify-between rounded-xl px-4 py-2.5">
                        <span className="text-muted-foreground">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Alignment on money and rhythm prevents 90% of breakups.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() => setStep((s) => (s + 1) % PREVIEW_STEPS.length)}
            >
              {step === PREVIEW_STEPS.length - 1 ? "Replay" : "Next"} <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </GlassPanel>

        {/* AI parser */}
        <GlassPanel className="rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(262_75%_58%)] to-[hsl(200_80%_55%)] text-white">
              <BrainCircuit className="size-4.5" />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold">Natural-language bio parser</h3>
              <p className="text-xs text-muted-foreground">Paste your LinkedIn — we map your graph</p>
            </div>
          </div>

          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setApplied(false);
            }}
            rows={4}
            className="glass-subtle mt-5 w-full resize-none rounded-xl p-4 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:border-primary/40"
            placeholder="Paste your LinkedIn or describe what you're building…"
          />

          <div className="mt-4 space-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Detected skills</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {parsed.detectedSkills.length ? (
                  parsed.detectedSkills.map((s) => <MonoTag key={s} className="border-primary/30 text-primary">{s}</MonoTag>)
                ) : (
                  <span className="text-xs text-muted-foreground">Keep typing…</span>
                )}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Industries</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {parsed.suggestedIndustries.length ? (
                  parsed.suggestedIndustries.map((s) => <MonoTag key={s} className="border-emerald-500/30 text-emerald-400">{s}</MonoTag>)
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs leading-5 text-muted-foreground">{parsed.summary}</p>
            <Button size="sm" variant={applied ? "outline" : "default"} className="shrink-0 rounded-xl" onClick={apply}>
              {applied ? <><X className="size-3.5" /> Remap</> : <><Sparkles className="size-3.5" /> Map my graph</>}
            </Button>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Features                                                           */
/* ================================================================== */

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Vision-synergy engine",
    body: "Every pair is scored on vision, skills, working style, commitment and equity — five weighted factors, one honest number.",
  },
  {
    icon: RadarIcon,
    title: "Skillset radar",
    body: "Tech vs Product vs Growth vs Ops, plotted side-by-side. See where you complement — and where you'd double-count.",
  },
  {
    icon: Filter,
    title: "Smart filters",
    body: "Industry, stack, geography, funding stage and equity expectation. The deck reshapes itself as you filter.",
  },
  {
    icon: Coffee,
    title: "Coffee chat in one tap",
    body: "No cold intros. Request a 20-minute video coffee and we handle the scheduling handshake.",
  },
  {
    icon: FileText,
    title: "NDA & deck requests",
    body: "Swap decks under NDA before you commit a single hour to diligence on each other.",
  },
  {
    icon: ShieldCheck,
    title: "Verified operators",
    body: "Track record, references and response-time badges. Less LinkedIn theater, more signal.",
  },
] as const;

function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-24">
      <SectionHeading
        eyebrow="Matching AI"
        title={<>LinkedIn credibility, <span className="text-gradient">matchmaker mechanics</span></>}
        sub="FoundrMatch runs a compatibility engine purpose-built for the highest-stakes relationship in your company: the cap table."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
          >
            <GlassPanel hover className="h-full rounded-2xl p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(262_75%_58%/0.2)] to-[hsl(160_70%_50%/0.16)] text-primary ring-1 ring-white/10">
                <f.icon className="size-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{f.body}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Discovery preview                                                  */
/* ================================================================== */

function DeckPreview() {
  const [selected, setSelected] = useState(1);
  const f = FOUNDERS[selected];
  const sampleMe = { Tech: 45, Product: 62, Growth: 58, Ops: 40 } as const;
  const radarData = (["Tech", "Product", "Growth", "Ops"] as const).map((axis) => ({
    axis,
    me: sampleMe[axis],
    them: f.radar[axis],
  }));

  return (
    <section id="deck" className="mx-auto w-full max-w-6xl px-4 py-24">
      <SectionHeading
        eyebrow="Catalog & Discovery"
        title={<>Browse like LinkedIn, <span className="text-gradient">match like a pro</span></>}
        sub="A searchable catalog with the numbers that matter: compatibility score, pitch, stack — and a full synergy breakdown plus a conversation thread on every profile."
      />

      <div className="mt-12 grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Profile card */}
        <GlassPanel strong className="rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <FounderAvatar name={f.name} hue={f.avatarHue} className="size-12" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                {f.name}
                {f.verified && <BadgeCheck className="size-4 text-primary" />}
              </p>
              <p className="truncate text-xs text-muted-foreground">{f.title}</p>
            </div>
            <ScoreRing value={[94, 91, 88, 83][selected]} size={64} label="match" hue={[262, 160, 24, 200][selected]} />
          </div>

          <p className="mt-4 text-sm leading-6">{f.pitch}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <MonoTag className="border-primary/30 text-primary">{f.lookingFor}</MonoTag>
            {f.stack.slice(0, 4).map((s) => (
              <MonoTag key={s}>{s}</MonoTag>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" className="rounded-xl" asChild>
              <Link to="/auth?returnTo=%2Ffounders">
                <Coffee className="size-3.5" /> Open full profile
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="glass-subtle rounded-xl border-white/10" asChild>
              <Link to="/auth?returnTo=%2Ffounders">
                <FileText className="size-3.5" /> See the catalog
              </Link>
            </Button>
          </div>
        </GlassPanel>

        {/* Radar + selector */}
        <div className="flex flex-col gap-4">
          <GlassPanel className="rounded-3xl p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Skillset radar</h3>
              <MonoTag className="border-emerald-500/30 text-emerald-400">Complementary</MonoTag>
            </div>
            <MatchRadar data={radarData} height={250} />
            <div className="mt-1">
              <RadarLegend meLabel="You (sample)" themLabel={f.name.split(" ")[0]} />
            </div>
          </GlassPanel>

          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {FOUNDERS.map((p, i) => (
              <button key={p.id} onClick={() => setSelected(i)} className="shrink-0 text-left">
                <GlassPanel
                  hover
                  className={cn(
                    "flex w-60 items-center gap-3 rounded-2xl p-3",
                    i === selected && "border-primary/40 shadow-[0_0_0_3px_hsl(262_75%_58%/0.25)]",
                  )}
                >
                  <FounderAvatar name={p.name} hue={p.avatarHue} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.industries.join(" · ")}</p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {[94, 91, 88, 83][i]}%
                  </span>
                </GlassPanel>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Steps + final CTA + footer                                         */
/* ================================================================== */

function Steps() {
  const steps = [
    { icon: UserPlus, title: "Map your graph", body: "Two sentences or a pasted bio. The parser extracts skills, industries, stage and expectations." },
    { icon: Layers, title: "Browse the catalog", body: "Search and filter verified founders ranked by how well they complement your graph." },
    { icon: Coffee, title: "Message, then meet", body: "Open a thread, book a coffee chat, swap decks under NDA — then build the thing together." },
  ];
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24">
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <GlassPanel className="h-full rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-primary">0{i + 1}</span>
                <s.icon className="size-4.5 text-muted-foreground" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{s.body}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  const navigate = useNavigate();
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24">
      <GlassPanel strong className="edge-top relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-14">
        <div aria-hidden className="glass-mesh absolute inset-0 opacity-70" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your co-founder is already on the deck.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Free to join. Three minutes to a mapped graph. The average pair on FoundrMatch
            books a coffee chat within 48 hours.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 rounded-2xl px-6 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]"
              onClick={() => startIntent("tech", navigate)}
            >
              Start matching free <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="              glass-subtle h-12 rounded-2xl border-white/10 px-6 hover:bg-white/10"
              onClick={() => startIntent("commercial", navigate)}
            >
              I'm technical — find a commercial partner
            </Button>
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-foreground/5 px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(262_75%_58%)] to-[hsl(200_80%_55%)] text-white">
            <RadarIcon className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground">Founder Connect AI</span>
          <span className="text-xs">© 2026</span>
        </div>
        <div className="flex gap-5 text-xs">
          <a href="#onboarding" className="hover:text-foreground">How it works</a>
          <a href="#features" className="hover:text-foreground">Matching AI</a>
          <a href="#deck" className="hover:text-foreground">Catalog</a>
          <Link to="/auth?returnTo=%2Ffounders" className="hover:text-foreground">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function Landing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-x-clip"
    >
      <GlassNav />
      <main>
        <Hero />
        <OnboardingPreview />
        <Features />
        <DeckPreview />
        <Steps />
        <FinalCta />
      </main>
      <Footer />
    </motion.div>
  );
}
