import { cn } from "@/lib/utils";

/**
 * Light-glass panel used across FoundrMatch. Forwards all div props.
 * `hover` adds the signature lift-on-hover interaction.
 */
export function GlassPanel({
  className,
  hover = false,
  strong = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl edge-top",
        strong ? "glass-strong" : "glass",
        hover && "glass-hover",
        className,
      )}
      {...props}
    />
  );
}

/** Eyebrow chip + title + subcopy used to open each landing section. */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      <span className="tag font-mono uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </span>
      <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">{sub}</p>}
    </div>
  );
}

/** Small circular avatar generated from the founder's hue — no image assets. */
export function FounderAvatar({
  name,
  hue,
  className,
}: {
  name: string;
  hue: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full text-sm font-semibold text-white",
        "ring-1 ring-white/60 shadow-[0_2px_10px_-2px_rgba(99,102,241,0.45)]",
        className,
      )}
      style={{
        width: 40,
        height: 40,
        background: `linear-gradient(135deg, hsl(${hue} 72% 58%), hsl(${(hue + 40) % 360} 70% 48%))`,
      }}
    >
      {initials}
    </div>
  );
}

/** Mono-font pill for stacks, scores, and technical tags. */
export function MonoTag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("tag font-mono text-[11px]", className)}>{children}</span>;
}
