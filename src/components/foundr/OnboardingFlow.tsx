import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ONBOARDING,
  parseBio,
  type EquityExpectation,
  type Onboarding,
  type Stage,
  type TimeCommitment,
  type WorkStyle,
} from "@/lib/foundr";

const STEPS = ["Vision", "Stage", "Role gaps", "Commitment", "Values & Equity"] as const;

const STAGES: Stage[] = ["Idea", "Pre-seed", "Seed", "Series A"];
const COMMITMENTS: TimeCommitment[] = ["Full-time", "Part-time (nights & weekends)"];
const EQUITIES: EquityExpectation[] = ["Equal split", "Majority founder", "Flexible / negotiable"];
const STYLES: WorkStyle[] = ["Deep maker time", "Ship fast & iterate", "Structured & process-driven"];
const GAP_OPTIONS = [
  "Technical / AI",
  "Product Design",
  "GTM & Sales",
  "Ops & Finance",
  "Fundraising",
  "Domain Expertise",
];
const INDUSTRY_OPTIONS = [
  "AI / ML",
  "FinTech",
  "HealthTech",
  "DevTools",
  "Climate",
  "Logistics",
];

/**
 * Full onboarding: vision → stage → skill gaps → commitment → values/equity,
 * with the NL bio parser available on step 1. Saves to Convex on finish.
 */
export function OnboardingFlow({
  onComplete,
  defaultName = "",
}: {
  onComplete?: () => void;
  defaultName?: string;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Onboarding>(DEFAULT_ONBOARDING);
  const [bio, setBio] = useState("");
  const [parsed, setParsed] = useState<ReturnType<typeof parseBio> | null>(null);
  const [saving, setSaving] = useState(false);
  const upsert = useMutation(api.foundr.upsertProfile);

  const parsedLive = useMemo(() => (bio.trim().length > 8 ? parseBio(bio) : null), [bio]);

  const runParser = () => {
    if (!parsedLive) return;
    setParsed(parsedLive);
    setData((d) => ({
      ...d,
      stage: parsedLive.suggestedStage,
      commitment: parsedLive.suggestedCommitment,
      equity: parsedLive.suggestedEquity,
      industries: parsedLive.suggestedIndustries,
      gaps: parsedLive.detectedSkills.slice(0, 3),
    }));
  };

  const canContinue =
    (step === 0 && data.vision.trim().length >= 10) ||
    (step === 1 && data.stage) ||
    (step === 2 && data.gaps.length > 0) ||
    step === 3 ||
    step === 4;

  const finish = async () => {
    setSaving(true);
    try {
      const parsedBio = parsed ?? parsedLive;
      await upsert({
        name: defaultName || "Founder",
        vision: data.vision.trim(),
        stage: data.stage,
        industries: data.industries,
        gaps: data.gaps,
        commitment: data.commitment,
        equity: data.equity,
        workStyle: data.workStyle,
        lookingFor:
          data.gaps.includes("Technical / AI") || data.gaps.includes("Product Design")
            ? ("Technical Co-Founder" as const)
            : ("Commercial Co-Founder" as const),
        parsedSkills: parsedBio?.detectedSkills ?? [],
        radar: parsedBio?.radar,
      });
      onComplete?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              i === step
                ? "bg-gradient-to-r from-[hsl(262_75%_58%)] to-[hsl(160_70%_45%)]"
                : i < step
                  ? "bg-primary/40"
                  : "bg-foreground/10",
            )}
          />
        ))}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 min-h-[21rem]"
        >
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold">Your vision, in two sentences</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  What are you building, and for whom? Or paste your LinkedIn and let the AI map you.
                </p>
              </div>
              <Textarea
                value={data.vision}
                onChange={(e) => setData((d) => ({ ...d, vision: e.target.value }))}
                placeholder="e.g. LLM copilot that drafts clinical-trial protocols in hours instead of months."
                className="glass-subtle min-h-24 resize-none rounded-xl"
              />
              <div className="glass-subtle rounded-xl p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  AI bio parser
                </p>
                <Textarea
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setParsed(null);
                  }}
                  placeholder="Paste your LinkedIn summary or bio here…"
                  className="mt-2 min-h-16 resize-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {parsedLive?.detectedSkills.slice(0, 5).map((s) => (
                    <span key={s} className="tag font-mono text-[10px] text-primary">{s}</span>
                  ))}
                  {parsedLive && (
                    <Button size="sm" variant="secondary" className="ml-auto h-7 rounded-lg text-xs" onClick={runParser}>
                      <Sparkles className="size-3" /> Autofill from bio
                    </Button>
                  )}
                </div>
                {parsed && (
                  <p className="mt-2 text-xs text-emerald-700">{parsed.summary}</p>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold">Where are you now?</h3>
              <p className="mt-1 text-sm text-muted-foreground">We match you with founders at the same altitude.</p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setData((d) => ({ ...d, stage: s }))}
                    className={cn(
                      "glass-subtle rounded-xl px-4 py-4 text-sm font-medium transition-all",
                      data.stage === s &&
                        "border-primary/50 bg-white/70 shadow-[0_0_0_3px_hsl(262_75%_58%/0.12)]",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Industries</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {INDUSTRY_OPTIONS.map((i) => {
                  const active = data.industries.includes(i);
                  return (
                    <button key={i} onClick={() => setData((d) => ({ ...d, industries: active ? d.industries.filter((x) => x !== i) : [...d.industries, i] }))}>
                      <span className={cn("tag cursor-pointer transition-colors", active && "border-primary/50 bg-primary/10 text-primary")}>{i}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold">What's your skill gap?</h3>
              <p className="mt-1 text-sm text-muted-foreground">Your gaps define your matching weights.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {GAP_OPTIONS.map((g) => {
                  const active = data.gaps.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() =>
                        setData((d) => ({
                          ...d,
                          gaps: active ? d.gaps.filter((x) => x !== g) : [...d.gaps, g],
                        }))
                      }
                      className={cn(
                        "glass-subtle rounded-full px-4 py-2 text-sm font-medium transition-all",
                        active && "border-primary/50 bg-white/70 shadow-[0_0_0_3px_hsl(262_75%_58%/0.12)]",
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold">Time commitment</h3>
              <p className="mt-1 text-sm text-muted-foreground">Mixed commitment pairs get flagged before you chat.</p>
              <div className="mt-5 space-y-2">
                {COMMITMENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setData((d) => ({ ...d, commitment: c }))}
                    className={cn(
                      "glass-subtle flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all",
                      data.commitment === c && "border-primary/50 bg-white/70 shadow-[0_0_0_3px_hsl(262_75%_58%/0.12)]",
                    )}
                  >
                    {c}
                    {data.commitment === c && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold">Values & equity</h3>
              <p className="mt-1 text-sm text-muted-foreground">Alignment here prevents 90% of co-founder breakups.</p>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Equity expectation</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {EQUITIES.map((e) => (
                  <button
                    key={e}
                    onClick={() => setData((d) => ({ ...d, equity: e }))}
                    className={cn(
                      "glass-subtle rounded-xl px-2 py-3 text-xs font-medium transition-all",
                      data.equity === e && "border-primary/50 bg-white/70 shadow-[0_0_0_3px_hsl(262_75%_58%/0.12)]",
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Work style</p>
              <div className="mt-2 space-y-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setData((d) => ({ ...d, workStyle: s }))}
                    className={cn(
                      "glass-subtle flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      data.workStyle === s && "border-primary/50 bg-white/70 shadow-[0_0_0_3px_hsl(262_75%_58%/0.12)]",
                    )}
                  >
                    {s}
                    {data.workStyle === s && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          <ArrowLeft className="size-3.5" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button size="sm" className="rounded-xl" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight className="size-3.5" />
          </Button>
        ) : (
          <Button size="sm" className="rounded-xl" disabled={saving} onClick={finish}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-3.5" />}
            Enter the deck
          </Button>
        )}
      </div>
    </div>
  );
}

/** Self-onboarded users may skip entering a name; quick inline ask. */
export function NameAsk({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your name"
      className="glass-subtle rounded-xl"
    />
  );
}
