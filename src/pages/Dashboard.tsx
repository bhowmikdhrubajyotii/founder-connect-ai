import { useMemo, useState } from "react";
import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Clock,
  Coffee,
  Compass,
  Eye,
  FileText,
  Filter as FilterIcon,
  Globe,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FounderAvatar, GlassPanel, MonoTag } from "@/components/foundr/GlassKit";
import { ScoreRing } from "@/components/foundr/ScoreRing";
import { MatchRadar, RadarLegend } from "@/components/foundr/MatchRadar";
import { OnboardingFlow } from "@/components/foundr/OnboardingFlow";
import { useAuth } from "@/hooks/use-auth";
import {
  applyFilters,
  computeSynergy,
  EMPTY_FILTERS,
  FOUNDERS,
  INDUSTRIES,
  STACKS,
  type Filters,
  type FounderProfile,
  type Onboarding,
} from "@/lib/foundr";
import { cn } from "@/lib/utils";

/* ================================================================== */
/*  Filter bar                                                         */
/* ================================================================== */

function FilterBar({
  filters,
  onChange,
  shown,
  total,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  shown: number;
  total: number;
}) {
  const ANY = "__any__";
  const set = (k: keyof Filters) => (v: string) => onChange({ ...filters, [k]: v === ANY ? "" : v });
  const active = Object.values(filters).filter(Boolean).length;

  return (
    <GlassPanel className="rounded-2xl p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ml-1 mr-1 hidden items-center gap-1.5 text-xs font-semibold text-muted-foreground sm:flex">
          <FilterIcon className="size-3.5" /> Filters
        </span>
        <Select value={filters.industry || ANY} onValueChange={set("industry")}>
          <SelectTrigger size="sm" className="glass-subtle w-[9.5rem] rounded-xl border-white/60">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any industry</SelectItem>
            {INDUSTRIES.map((i) => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.stack || ANY} onValueChange={set("stack")}>
          <SelectTrigger size="sm" className="glass-subtle w-[9.5rem] rounded-xl border-white/60">
            <SelectValue placeholder="Tech stack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any stack</SelectItem>
            {STACKS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.stage || ANY} onValueChange={set("stage")}>
          <SelectTrigger size="sm" className="glass-subtle w-[9.5rem] rounded-xl border-white/60">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any stage</SelectItem>
            {["Idea", "Pre-seed", "Seed", "Series A"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.equity || ANY} onValueChange={set("equity")}>
          <SelectTrigger size="sm" className="glass-subtle w-[10.5rem] rounded-xl border-white/60">
            <SelectValue placeholder="Equity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any equity</SelectItem>
            {["Equal split", "Majority founder", "Flexible / negotiable"].map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative min-w-40 flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.geo}
            onChange={(e) => onChange({ ...filters, geo: e.target.value })}
            placeholder="Geography or “Remote”"
            className="glass-subtle h-8 rounded-xl border-white/60 pl-8 text-xs"
          />
        </div>
        {active > 0 && (
          <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs" onClick={() => onChange(EMPTY_FILTERS)}>
            <X className="size-3.5" /> Clear
          </Button>
        )}
        <span className="ml-auto hidden font-mono text-[11px] text-muted-foreground md:block">
          {shown}/{total} founders
        </span>
      </div>
    </GlassPanel>
  );
}

/* ================================================================== */
/*  Swipeable founder card                                             */
/* ================================================================== */

function SwipeCard({
  founder,
  me,
  onPass,
  onCoffee,
  onNda,
  onDetails,
  isTop,
}: {
  founder: FounderProfile;
  me: Pick<Onboarding, "stage" | "commitment" | "equity" | "workStyle" | "lookingFor" | "industries">;
  onPass: () => void;
  onCoffee: () => void;
  onNda: () => void;
  onDetails: () => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-9, 9]);
  const passOpacity = useTransform(x, [-140, -40], [1, 0]);
  const coffeeOpacity = useTransform(x, [40, 140], [0, 1]);
  const synergy = useMemo(() => computeSynergy(me, founder), [me, founder]);

  return (
    <motion.div
      className="relative w-full max-w-md cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ x, rotate }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={(_, info: PanInfo) => {
        if (info.offset.x < -120) onPass();
        else if (info.offset.x > 120) onCoffee();
      }}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        x: x.get() >= 0 ? 420 : -420,
        opacity: 0,
        rotate: x.get() >= 0 ? 12 : -12,
        transition: { duration: 0.32 },
      }}
    >
      <GlassPanel strong className="rounded-3xl p-6">
        {/* drag stamps */}
        <motion.span
          style={{ opacity: passOpacity }}
          className="absolute left-5 top-5 z-10 -rotate-12 rounded-lg border-2 border-rose-400/80 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-rose-500/90"
        >
          Pass
        </motion.span>
        <motion.span
          style={{ opacity: coffeeOpacity }}
          className="absolute right-5 top-5 z-10 rotate-12 rounded-lg border-2 border-emerald-400/80 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-widest text-emerald-600/90"
        >
          Coffee
        </motion.span>

        <div className="flex items-start gap-3">
          <FounderAvatar name={founder.name} hue={founder.avatarHue} className="size-12" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-base font-semibold">
              {founder.name}
              {founder.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
            </p>
            <p className="truncate text-xs text-muted-foreground">{founder.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3" /> {founder.location}
              {founder.remoteFriendly && <span className="tag ml-1 px-1.5 py-0 text-[9px]">Remote-ok</span>}
            </p>
          </div>
          <ScoreRing value={synergy.overall} size={72} hue={founder.avatarHue} label="match" />
        </div>

        <p className="mt-4 text-sm font-medium">{founder.headline}</p>
        <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-muted-foreground">{founder.pitch}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <MonoTag className="border-primary/30 text-primary">{founder.lookingFor}</MonoTag>
          {founder.stack.slice(0, 4).map((s) => (
            <MonoTag key={s}>{s}</MonoTag>
          ))}
        </div>

        <div className="glass-divider my-4" />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="size-3" /> {founder.responseTime}</span>
          <span className="font-mono">{founder.stage} · {founder.commitment.split(" (")[0]}</span>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
          <Button size="sm" className="rounded-xl" onClick={onCoffee}>
            <Coffee className="size-3.5" /> Coffee Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="glass-subtle rounded-xl border-white/60"
            onClick={onNda}
          >
            <FileText className="size-3.5" /> Request NDA
          </Button>
          <Button size="sm" variant="ghost" className="rounded-xl text-muted-foreground" onClick={onPass}>
            <X className="size-3.5" /> Pass
          </Button>
        </div>
        <button
          onClick={onDetails}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <Eye className="size-3.5" /> View Vision Synergy Breakdown
        </button>
      </GlassPanel>
    </motion.div>
  );
}

/* ================================================================== */
/*  Synergy modal                                                      */
/* ================================================================== */

function SynergyModal({
  founder,
  me,
  open,
  onOpenChange,
}: {
  founder: FounderProfile | null;
  me: Pick<Onboarding, "stage" | "commitment" | "equity" | "workStyle" | "lookingFor" | "industries">;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  if (!founder) return null;
  const synergy = computeSynergy(me, founder);
  const sampleMeRadar = { Tech: 45, Product: 62, Growth: 58, Ops: 40 } as const;
  const radarData = (["Tech", "Product", "Growth", "Ops"] as const).map((axis) => ({
    axis,
    me: sampleMeRadar[axis],
    them: founder.radar[axis],
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong w-full max-w-lg rounded-3xl border-white/70 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FounderAvatar name={founder.name} hue={founder.avatarHue} className="size-10" />
            <span>
              Vision Synergy · {founder.name.split(" ")[0]}
            </span>
            <span className="ml-auto scale-90">
              <ScoreRing value={synergy.overall} size={58} stroke={6} hue={founder.avatarHue} label="" />
            </span>
          </DialogTitle>
          <DialogDescription>{synergy.headline}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2.5">
            {synergy.factors.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{f.label}</span>
                  <span className="font-mono font-semibold tabular">{f.score}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foreground/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.score}%` }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "h-full rounded-full",
                      f.score >= 90
                        ? "bg-gradient-to-r from-[hsl(160_70%_45%)] to-[hsl(160_70%_55%)]"
                        : f.score >= 75
                          ? "bg-gradient-to-r from-[hsl(262_75%_58%)] to-[hsl(220_75%_58%)]"
                          : "bg-gradient-to-r from-[hsl(30_80%_55%)] to-[hsl(45_85%_60%)]",
                    )}
                  />
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{f.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-subtle rounded-2xl p-3">
            <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Skillset radar
            </p>
            <MatchRadar data={radarData} height={210} />
            <RadarLegend meLabel="You" themLabel={founder.name.split(" ")[0]} />
          </div>
        </div>

        <div className="glass-divider" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" /> {founder.location} · {founder.remoteFriendly ? "Remote-friendly" : "On-site"}
          </span>
          <span className="flex items-center gap-1.5">
            <Compass className="size-3.5" /> {founder.workStyle}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery(api.foundr.getMyProfile);
  const actions = useQuery(api.foundr.myActions);
  const recordAction = useMutation(api.foundr.recordAction);
  const resetActions = useMutation(api.foundr.resetActions);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [modalFounder, setModalFounder] = useState<FounderProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);

  const me = useMemo<Pick<Onboarding, "stage" | "commitment" | "equity" | "workStyle" | "lookingFor" | "industries">>(
    () =>
      profile
        ? {
            stage: profile.stage as Onboarding["stage"],
            commitment: profile.commitment as Onboarding["commitment"],
            equity: profile.equity as Onboarding["equity"],
            workStyle: profile.workStyle as Onboarding["workStyle"],
            lookingFor: profile.lookingFor as Onboarding["lookingFor"],
            industries: profile.industries,
          }
        : {
            stage: "Idea",
            commitment: "Full-time",
            equity: "Equal split",
            workStyle: "Ship fast & iterate",
            lookingFor: "Technical Co-Founder",
            industries: [],
          },
    [profile],
  );

  const filtered = useMemo(() => applyFilters(FOUNDERS, filters), [filters]);
  const queue = filtered.slice(queueIndex);
  const top = queue[0];
  const next = queue[1];
  const passedIds = useMemo(
    () => new Set((actions ?? []).filter((a) => a.action === "pass").map((a) => a.founderId)),
    [actions],
  );
  const visibleQueue = queue.filter((f) => !passedIds.has(f.id));
  const visibleTop = visibleQueue[0];
  const visibleNext = visibleQueue[1];

  /** Record an action and advance the deck. */
  const advance = async (
    founder: FounderProfile,
    action: "coffee" | "nda" | "pass",
  ) => {
    try {
      await recordAction({ founderId: founder.id, action });
    } catch {
      toast.error("Could not record that action. Try again.");
      return;
    }
    if (action === "coffee") {
      toast.success(`Coffee chat requested with ${founder.name.split(" ")[0]} ☕`, {
        description: `${founder.responseTime}. We'll handle the scheduling handshake.`,
      });
    } else if (action === "nda") {
      toast(`NDA/deck request sent to ${founder.name.split(" ")[0]}`, {
        description: "You'll both get redacted previews once countersigned.",
      });
    } else {
      toast(`Passed on ${founder.name.split(" ")[0]}`, {
        description: "We'll tune future matches. Reset the deck to reconsider.",
      });
    }
    setQueueIndex((i) => i + 1);
  };

  const resetDeck = async () => {
    setFilters(EMPTY_FILTERS);
    try {
      await resetActions({});
    } catch {
      /* non-fatal */
    }
    setQueueIndex(0);
    toast("Deck reset — all founders back in the queue.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  /* ---- Loading: wait for the profile query before gating ---- */
  if (profile === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  /* ---- First-run: onboarding wizard ---- */
  if (profile === null) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
        <div aria-hidden className="glass-mesh absolute inset-0 noise" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassPanel strong className="edge-top rounded-3xl p-8 sm:p-10">
            <div className="mb-8 flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(262_75%_58%)] to-[hsl(200_80%_55%)] text-white">
                <BrainCircuit className="size-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold">Set up your founder graph</p>
                <p className="text-xs text-muted-foreground">5 steps · ~3 minutes · powers every match score</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
            <OnboardingFlow
              defaultName={user?.name ?? ""}
              onComplete={() => toast.success("Graph mapped — welcome to the deck 🎉")}
            />
          </GlassPanel>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip pb-16">
      {/* top bar */}
      <header className="sticky top-0 z-40 flex justify-center px-4 pt-4">
        <GlassPanel className="flex w-full max-w-5xl items-center gap-3 rounded-2xl px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(262_75%_58%)] to-[hsl(200_80%_55%)] text-white">
              <Compass className="size-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Foundr<span className="text-gradient">Match</span>
            </span>
          </Link>
          <span className="tag ml-2 hidden font-mono text-[10px] text-emerald-700 sm:inline-flex">
            {actions?.length ?? 0} actions taken
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden rounded-xl text-muted-foreground sm:inline-flex"
              onClick={resetDeck}
            >
              <RotateCcw className="size-3.5" /> Reset deck
            </Button>
            <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </GlassPanel>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mt-8 flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            The Discovery Deck
          </h1>
          <p className="text-sm text-muted-foreground">
            Swipe right for coffee, left to pass. Scores are computed from your graph —
            tap a card to see the math.
          </p>
        </div>

        <div className="mt-5">
          <FilterBar filters={filters} onChange={setFilters} shown={filtered.length} total={FOUNDERS.length} />
        </div>

        {/* deck */}
        <div className="relative mx-auto mt-8 flex min-h-[34rem] w-full flex-col items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleTop ? (
              <motion.div
                key={visibleTop.id}
                className="absolute top-0 w-full max-w-md"
                exit={{ x: 0 }}
                layout
              >
                <SwipeCard
                  founder={visibleTop}
                  me={me}
                  isTop
                  onPass={() => advance(visibleTop, "pass")}
                  onCoffee={() => advance(visibleTop, "coffee")}
                  onNda={() => advance(visibleTop, "nda")}
                  onDetails={() => {
                    setModalFounder(visibleTop);
                    setModalOpen(true);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-subtle mt-10 flex max-w-sm flex-col items-center rounded-3xl px-8 py-12 text-center"
              >
                <Sparkles className="size-6 text-primary" />
                <p className="mt-3 text-sm font-semibold">You've seen every compatible founder</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Adjust filters or reset the deck to review profiles again.
                </p>
                <Button size="sm" className="mt-5 rounded-xl" onClick={resetDeck}>
                  <RotateCcw className="size-3.5" /> Reset deck
                </Button>
              </motion.div>
            )}
            {visibleNext && (
              <motion.div key={`${visibleNext.id}-bg`} className="pointer-events-none absolute top-3 w-full max-w-sm opacity-60" layout>
                <GlassPanel className="rounded-3xl p-6">
                  <div className="flex items-center gap-3">
                    <FounderAvatar name={visibleNext.name} hue={visibleNext.avatarHue} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{visibleNext.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{visibleNext.title}</p>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Button
            variant="outline"
            className="glass-subtle rounded-2xl border-white/60"
            disabled={!visibleTop}
            onClick={() => visibleTop && advance(visibleTop, "pass")}
          >
            <X className="size-4 text-rose-500" /> Pass
          </Button>
          <Button
            className="rounded-2xl shadow-[0_10px_30px_-10px_rgba(99,102,241,0.7)]"
            disabled={!visibleTop}
            onClick={() => visibleTop && advance(visibleTop, "coffee")}
          >
            <Coffee className="size-4" /> Coffee Chat
          </Button>
          <Button
            variant="outline"
            className="glass-subtle rounded-2xl border-white/60"
            disabled={!visibleTop}
            onClick={() => {
              if (!visibleTop) return;
              setModalFounder(visibleTop);
              setModalOpen(true);
            }}
          >
            Synergy <ArrowRight className="size-4" />
          </Button>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          Prototype tip: drag the card or use the buttons — actions sync to your account.
        </p>
      </div>

      <SynergyModal founder={modalFounder} me={me} open={modalOpen} onOpenChange={setModalOpen} />
    </main>
  );
}
