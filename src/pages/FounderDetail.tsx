import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Coffee,
  Compass,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Send,
  Sparkles,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel, FounderAvatar, MonoTag } from "@/components/foundr/GlassKit";
import { ScoreRing } from "@/components/foundr/ScoreRing";
import { MatchRadar, RadarLegend } from "@/components/foundr/MatchRadar";
import {
  computeSynergy,
  DEFAULT_ME,
  getFounder,
  type MeProfile,
} from "@/lib/foundr";
import { cn } from "@/lib/utils";

export default function FounderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profile = useQuery(api.foundr.getMyProfile);
  const comments = useQuery(api.comments.listComments, { founderId: id ?? "" });
  const addComment = useMutation(api.comments.addComment);
  const recordAction = useMutation(api.foundr.recordAction);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const founder = id ? getFounder(id) : undefined;
  const me: MeProfile = useMemo(
    () =>
      profile
        ? {
            stage: profile.stage as MeProfile["stage"],
            commitment: profile.commitment as MeProfile["commitment"],
            equity: profile.equity as MeProfile["equity"],
            workStyle: profile.workStyle as MeProfile["workStyle"],
            lookingFor: profile.lookingFor as MeProfile["lookingFor"],
            industries: profile.industries,
          }
        : DEFAULT_ME,
    [profile],
  );

  const synergy = useMemo(() => (founder ? computeSynergy(me, founder) : null), [me, founder]);
  const myRadar = (profile?.radar ?? { Tech: 45, Product: 62, Growth: 58, Ops: 40 }) as Record<
    "Tech" | "Product" | "Growth" | "Ops",
    number
  >;
  const radarData = useMemo(
    () =>
      founder
        ? (["Tech", "Product", "Growth", "Ops"] as const).map((axis) => ({
            axis,
            me: myRadar[axis],
            them: founder.radar[axis],
          }))
        : [],
    [founder, myRadar],
  );

  if (!founder) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold">Founder not found</p>
        <p className="text-sm text-muted-foreground">
          This profile may have been removed from the catalog.
        </p>
        <Button className="rounded-xl" asChild>
          <Link to="/founders"><ArrowLeft className="size-4" /> Back to catalog</Link>
        </Button>
      </main>
    );
  }

  const first = founder.name.split(" ")[0];

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await addComment({ founderId: founder.id, body: draft });
      setDraft("");
      toast.success(`Message posted to ${first}'s thread`);
    } catch {
      toast.error("Could not post your message. Try again.");
    } finally {
      setSending(false);
    }
  };

  const act = async (action: "coffee" | "nda" | "pass") => {
    try {
      await recordAction({ founderId: founder.id, action });
      toast.success(
        action === "coffee"
          ? `Coffee chat requested with ${first} ☕`
          : action === "nda"
            ? `NDA/deck request sent to ${first}`
            : `Noted — we'll deprioritize ${first} for you`,
        { description: founder.responseTime },
      );
    } catch {
      toast.error("Could not record that action. Try again.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 pb-20 pt-24">
      <div aria-hidden className="glass-mesh absolute inset-x-0 top-0 h-96 opacity-60" />
      <div className="relative mx-auto w-full max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        {/* Header card */}
        <GlassPanel strong className="edge-top mt-4 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <FounderAvatar name={founder.name} hue={founder.avatarHue} className="size-16 text-lg" />
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                {founder.name}
                {founder.verified && <BadgeCheck className="size-5 text-primary" />}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{founder.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {founder.location}</span>
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" /> {founder.remoteFriendly ? "Remote-friendly" : "On-site preferred"}
                </span>
                <span className="flex items-center gap-1"><Compass className="size-3.5" /> {founder.workStyle}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Vision alignment</p>
                <p className="font-mono text-2xl font-semibold tabular text-emerald-400">{synergy?.visionAlignment}%</p>
              </div>
              <ScoreRing value={synergy?.overall ?? 0} size={84} hue={founder.avatarHue} label="match" />
            </div>
          </div>

          <p className="mt-5 text-[15px] font-medium">{founder.headline}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{founder.pitch}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <MonoTag className="border-primary/30 text-primary">{founder.lookingFor}</MonoTag>
            <MonoTag>{founder.stage}</MonoTag>
            <MonoTag>{founder.commitment}</MonoTag>
            <MonoTag>{founder.equity}</MonoTag>
            {founder.stack.map((s) => (
              <MonoTag key={s}>{s}</MonoTag>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" className="rounded-xl" onClick={() => act("coffee")}>
              <Coffee className="size-3.5" /> Schedule Coffee Chat
            </Button>
            <Button size="sm" variant="outline" className="glass-subtle rounded-xl border-white/10" onClick={() => act("nda")}>
              <FileText className="size-3.5" /> Request NDA / Deck
            </Button>
            <Button size="sm" variant="ghost" className="rounded-xl text-muted-foreground" onClick={() => act("pass")}>
              Pass
            </Button>
          </div>
        </GlassPanel>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Synergy breakdown */}
          <GlassPanel className="rounded-3xl p-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4.5 text-primary" />
              <h2 className="text-[15px] font-semibold">Vision Synergy Breakdown</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Five weighted factors computed from your graph and {first}'s public profile.
            </p>
            <div className="mt-5 space-y-4">
              {synergy?.factors.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.35 }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{f.label}</span>
                    <span className="font-mono font-semibold tabular">{f.score}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.score}%` }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        "h-full rounded-full",
                        f.score >= 90
                          ? "bg-gradient-to-r from-[hsl(160_70%_42%)] to-[hsl(160_70%_52%)]"
                          : f.score >= 75
                            ? "bg-gradient-to-r from-[hsl(262_75%_58%)] to-[hsl(220_75%_58%)]"
                            : "bg-gradient-to-r from-[hsl(30_80%_50%)] to-[hsl(45_85%_55%)]",
                      )}
                    />
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{f.detail}</p>
                </motion.div>
              ))}
            </div>
          </GlassPanel>

          {/* Radar + notables */}
          <div className="flex flex-col gap-6">
            <GlassPanel className="rounded-3xl p-6">
              <h2 className="text-[15px] font-semibold">Skillset radar</h2>
              <p className="mt-1 text-xs text-muted-foreground">Where you complement each other — and where you'd double-count.</p>
              <div className="mt-2">
                <MatchRadar data={radarData} height={230} />
                <RadarLegend meLabel="You" themLabel={first} />
              </div>
            </GlassPanel>

            <GlassPanel className="rounded-3xl p-6">
              <h2 className="text-[15px] font-semibold">Track record</h2>
              <ul className="mt-3 space-y-2">
                {founder.notable.map((n) => (
                  <li key={n} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {n}
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </div>
        </div>

        {/* Comment thread */}
        <GlassPanel className="mt-6 rounded-3xl p-6">
          <h2 className="text-[15px] font-semibold">Conversation with {first}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Public thread — introduce yourself, share context, align on next steps.
          </p>

          <div className="mt-5 space-y-3">
            {comments === undefined ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading conversation…
              </div>
            ) : comments.length === 0 ? (
              <div className="glass-subtle rounded-2xl px-4 py-6 text-center text-sm text-muted-foreground">
                No messages yet. Say hello — {first} usually replies {founder.responseTime.toLowerCase()}.
              </div>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="glass-subtle rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">{c.authorName ?? "A founder"}</span>
                    <span className="text-muted-foreground">
                      {new Date(c._creationTime).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6">{c.body}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={send} className="mt-4 flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Introduce yourself to ${first}…`}
              rows={2}
              className="glass-subtle flex-1 resize-none rounded-xl"
            />
            <Button type="submit" size="sm" className="rounded-xl" disabled={sending || !draft.trim()}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
              Send
            </Button>
          </form>
        </GlassPanel>
      </div>
    </main>
  );
}
