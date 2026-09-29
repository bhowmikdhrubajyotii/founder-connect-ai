import { Link } from "react-router";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { GlassPanel, FounderAvatar, MonoTag } from "@/components/foundr/GlassKit";
import { ScoreRing } from "@/components/foundr/ScoreRing";
import { computeSynergy, type FounderProfile, type MeProfile } from "@/lib/foundr";

/**
 * Catalog-style founder card: avatar, verified badge, pitch snippet,
 * stack tags and the animated compatibility ring. Links to the detail page.
 */
export function FounderCard({
  founder,
  me,
  index = 0,
}: {
  founder: FounderProfile;
  me: MeProfile;
  index?: number;
}) {
  const synergy = computeSynergy(me, founder);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
    >
      <GlassPanel hover className="group flex h-full flex-col rounded-3xl p-5">
        <div className="flex items-start gap-3">
          <FounderAvatar name={founder.name} hue={founder.avatarHue} className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[15px] font-semibold">
              {founder.name}
              {founder.verified && <BadgeCheck className="size-4 shrink-0 text-primary" />}
            </p>
            <p className="truncate text-xs text-muted-foreground">{founder.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3" /> {founder.location}
              {founder.remoteFriendly && <span className="tag ml-1 px-1.5 py-0 text-[9px]">Remote-ok</span>}
            </p>
          </div>
          <ScoreRing value={synergy.overall} size={64} stroke={6} hue={founder.avatarHue} label="" />
        </div>

        <p className="mt-3.5 text-sm font-medium leading-snug">{founder.headline}</p>
        <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-5 text-muted-foreground">{founder.pitch}</p>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <MonoTag className="border-primary/30 text-primary">{founder.lookingFor}</MonoTag>
          {founder.stack.slice(0, 3).map((s) => (
            <MonoTag key={s}>{s}</MonoTag>
          ))}
        </div>

        <div className="glass-divider my-3.5" />
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="size-3" /> {founder.responseTime}
          </span>
          <Link
            to={`/founders/${founder.id}`}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            View profile →
          </Link>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
