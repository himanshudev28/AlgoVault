import type { Tag } from "@/data/questions";

// Crackr-style difficulty colors (green for easy, lime-400 is our accent — keep distinct)
export const TAG_STYLES: Record<Tag, string> = {
  easy:    "bg-green-500/10 text-green-400 border-green-500/20",
  "easy+": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  medium:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "medium+":"bg-orange-500/10 text-orange-400 border-orange-500/20",
  hard:    "bg-red-500/10 text-red-400 border-red-500/20",
};

export const TAG_DOT: Record<Tag, string> = {
  easy:    "bg-green-500",
  "easy+": "bg-cyan-500",
  medium:  "bg-amber-500",
  "medium+":"bg-orange-500",
  hard:    "bg-red-500",
};

export function DifficultyBadge({ tag }: { tag: Tag }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${TAG_STYLES[tag]}`}
    >
      {tag}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const style =
    platform === "LeetCode"
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-green-500/10 text-green-400 border-green-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${style}`}
    >
      {platform}
    </span>
  );
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function Ring({
  value,
  total,
  size = 120,
  stroke = 10,
  label,
  sublabel,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? value / total : 0;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="stroke-lime-400 transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-bold tabular-nums">{label ?? `${Math.round(pct * 100)}%`}</div>
        {sublabel && <div className="text-[11px] text-zinc-500">{sublabel}</div>}
      </div>
    </div>
  );
}

export function BookmarkIcon({ filled, className = "size-4" }: { filled?: boolean; className?: string }) {
  return filled ? (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" />
    </svg>
  );
}

export function RepeatIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function ExternalLinkIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// Crackr-style card: dark surface, tight border, no shadow
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 ${className}`}
    >
      {children}
    </div>
  );
}
