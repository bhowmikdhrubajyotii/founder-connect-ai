import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import type { RadarAxis } from "@/lib/foundr";

export type RadarPoint = { axis: RadarAxis; me: number; them: number };

const AXIS_LABEL: Record<RadarAxis, string> = {
  Tech: "Tech",
  Product: "Product",
  Growth: "Growth",
  Ops: "Ops",
};

/**
 * Interactive radar chart comparing two founder skillsets
 * (Tech vs Product vs Growth vs Ops) over a translucent glass grid.
 */
export function MatchRadar({
  data,
  height = 240,
  meLabel = "You",
  themLabel = "Them",
  className,
}: {
  data: RadarPoint[];
  height?: number;
  meLabel?: string;
  themLabel?: string;
  className?: string;
}) {
  const colorMe = "hsl(262 72% 56%)";
  const colorThem = "hsl(160 74% 42%)";

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="hsl(262 20% 40% / 0.18)" />
          <PolarAngleAxis
            dataKey="axis"
            tickFormatter={(v: RadarAxis) => AXIS_LABEL[v] ?? v}
            tick={{ fill: "hsl(262 12% 35%)", fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={meLabel}
            dataKey="me"
            stroke={colorMe}
            strokeWidth={2}
            fill={colorMe}
            fillOpacity={0.22}
            isAnimationActive
          />
          <Radar
            name={themLabel}
            dataKey="them"
            stroke={colorThem}
            strokeWidth={2}
            fill={colorThem}
            fillOpacity={0.18}
            isAnimationActive
          />
          <Tooltip
            cursor={{ stroke: "hsl(262 20% 40% / 0.25)" }}
            contentStyle={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.7)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "0 12px 32px -12px rgba(70,60,180,0.35)",
            }}
            labelStyle={{ fontWeight: 700, color: "hsl(262 20% 30%)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RadarLegend({ meLabel = "You", themLabel = "Them" }: { meLabel?: string; themLabel?: string }) {
  return (
    <div className="flex items-center justify-center gap-5 text-xs font-medium text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full" style={{ background: "hsl(262 72% 56%)" }} />
        {meLabel}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full" style={{ background: "hsl(160 74% 42%)" }} />
        {themLabel}
      </span>
    </div>
  );
}
