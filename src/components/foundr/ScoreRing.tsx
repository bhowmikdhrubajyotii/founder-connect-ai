import { cn } from "@/lib/utils";

/**
 * Animated circular "Match Compatibility Score".
 * Pure SVG + CSS transitions (no chart lib) so it can animate anywhere,
 * including inside Framer Motion card transitions.
 */
export function ScoreRing({
  value,
  size = 76,
  stroke = 7,
  label = "match",
  className,
  hue = 262,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
  hue?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = `${(pct / 100) * c} ${c}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${pct}% ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-foreground/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={dash}
          stroke={`hsl(${hue} 75% 55%)`}
          style={{
            transition: "stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 6px hsl(${hue} 75% 55% / 0.45))`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-base font-semibold tabular leading-none">
          {pct}
          <span className="text-[10px] font-medium">%</span>
        </span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
