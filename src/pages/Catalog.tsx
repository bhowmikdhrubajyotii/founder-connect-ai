import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Filter as FilterIcon,
  LayoutGrid,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { Link } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlassPanel, MonoTag, SectionHeading } from "@/components/foundr/GlassKit";
import { FounderCard } from "@/components/foundr/FounderCard";
import { OnboardingFlow } from "@/components/foundr/OnboardingFlow";
import { useAuth } from "@/hooks/use-auth";
import {
  applyFilters,
  computeSynergy,
  EMPTY_FILTERS,
  FOUNDERS,
  INDUSTRIES,
  STACKS,
  searchFounders,
  type Filters,
  type MeProfile,
} from "@/lib/foundr";
import { cn } from "@/lib/utils";

const ANY = "__any__";

export default function Catalog() {
  const { user } = useAuth();
  const profile = useQuery(api.foundr.getMyProfile);
  const upsertProfile = useMutation(api.foundr.upsertProfile);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState("match");

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

  const results = useMemo(() => {
    let list = searchFounders(applyFilters(FOUNDERS, filters), query);
    if (sort === "match") {
      list = [...list].sort(
        (a, b) => computeSynergy(me, b).overall - computeSynergy(me, a).overall,
      );
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "response") {
      const hours = (s: string) => (s.includes("~2h") ? 2 : s.includes("~15m") ? 0.25 : s.includes("~4h") ? 4 : 24);
      list = [...list].sort((a, b) => hours(a.responseTime) - hours(b.responseTime));
    }
    return list;
  }, [filters, query, sort, me]);

  /* First-run: offer the graph wizard inline */
  if (profile === null) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-16">
        <div aria-hidden className="glass-mesh noise absolute inset-0" />
        <div className="relative mx-auto max-w-lg">
          <SectionHeading
            eyebrow="Welcome"
            title={<>Map your graph to unlock <span className="text-gradient">personal scores</span></>}
            sub="Three minutes, five steps. Your answers power every compatibility number on this platform."
          />
          <GlassPanel strong className="edge-top mt-8 rounded-3xl p-8">
            <OnboardingFlow
              defaultName={user?.name ?? ""}
              onComplete={() => toast.success("Graph mapped — enjoy the catalog 🎉")}
            />
          </GlassPanel>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 pb-20 pt-24">
      <div aria-hidden className="glass-mesh absolute inset-x-0 top-0 h-96 opacity-60" />
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-1.5 pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Catalog</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Browse the founder catalog</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Every verified founder on the platform, ranked by how well their graph complements yours.
            Open a profile for the full synergy breakdown and the conversation thread.
          </p>
        </div>

        {/* Search + filter bar */}
        <GlassPanel className="mt-6 rounded-2xl p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search names, skills, industries, locations…"
                className="glass-subtle rounded-xl border-transparent pl-9"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Select value={filters.industry || ANY} onValueChange={(v) => setFilters((f) => ({ ...f, industry: v === ANY ? "" : v }))}>
              <SelectTrigger size="sm" className="glass-subtle w-[9.5rem] rounded-xl border-transparent">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any industry</SelectItem>
                {INDUSTRIES.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.stack || ANY} onValueChange={(v) => setFilters((f) => ({ ...f, stack: v === ANY ? "" : v }))}>
              <SelectTrigger size="sm" className="glass-subtle w-[9.5rem] rounded-xl border-transparent">
                <SelectValue placeholder="Stack" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any stack</SelectItem>
                {STACKS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.stage || ANY} onValueChange={(v) => setFilters((f) => ({ ...f, stage: v === ANY ? "" : v }))}>
              <SelectTrigger size="sm" className="glass-subtle w-[8.5rem] rounded-xl border-transparent">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>Any stage</SelectItem>
                {["Idea", "Pre-seed", "Seed", "Series A"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger size="sm" className="glass-subtle w-[10rem] rounded-xl border-transparent">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best match</SelectItem>
                <SelectItem value="response">Fastest reply</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
            {(query || Object.values(filters).some(Boolean)) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-xl text-xs"
                onClick={() => {
                  setQuery("");
                  setFilters(EMPTY_FILTERS);
                }}
              >
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            )}
            <span className="ml-auto hidden font-mono text-[11px] text-muted-foreground md:block">
              {results.length}/{FOUNDERS.length}
            </span>
          </div>
        </GlassPanel>

        {/* Results */}
        {results.length === 0 ? (
          <GlassPanel className="mt-8 flex flex-col items-center rounded-3xl px-8 py-14 text-center">
            <FilterIcon className="size-6 text-primary" />
            <p className="mt-3 text-sm font-semibold">No founders match those filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try broadening your search or clearing a filter.</p>
            <Button
              size="sm"
              className="mt-5 rounded-xl"
              onClick={() => {
                setQuery("");
                setFilters(EMPTY_FILTERS);
              }}
            >
              <RotateCcw className="size-3.5" /> Show everyone
            </Button>
          </GlassPanel>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((f, i) => (
              <FounderCard key={f.id} founder={f} me={me} index={i} />
            ))}
          </div>
        )}

        {/* Deck cross-link */}
        <GlassPanel className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl p-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(262_75%_58%/0.25)] to-[hsl(160_70%_50%/0.2)] text-primary ring-1 ring-white/10">
              <LayoutGrid className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Prefer the swipeable deck?</p>
              <p className="text-xs text-muted-foreground">
                Same founders, faster pace — drag right for coffee, left to pass.
              </p>
            </div>
          </div>
          <Button className="rounded-xl" asChild>
            <Link to="/dashboard">
              Open the Discovery Deck <ArrowRight className="size-4" />
            </Link>
          </Button>
        </GlassPanel>
      </div>
    </main>
  );
}
