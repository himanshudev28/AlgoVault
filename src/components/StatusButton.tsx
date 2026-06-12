"use client";

import type { Status } from "@/lib/types";

const NEXT: Record<Status, Status> = {
  not_started: "attempting",
  attempting: "solved",
  solved: "not_started",
};

const STYLE: Record<Status, { cls: string; glyph: string; label: string }> = {
  not_started: {
    cls: "border-zinc-200 dark:border-zinc-800 text-transparent hover:border-lime-300 border-zinc-200 dark:border-zinc-800",
    glyph: "✓",
    label: "Not started — click to mark attempting",
  },
  attempting: {
    cls: "border-amber-400 bg-amber-400/15 text-amber-500",
    glyph: "…",
    label: "Attempting — click to mark solved",
  },
  solved: {
    cls: "border-lime-400 bg-lime-400 text-white",
    glyph: "✓",
    label: "Solved — click to reset",
  },
};

export function StatusButton({
  status,
  onChange,
  size = "size-6",
}: {
  status: Status;
  onChange: (s: Status) => void;
  size?: string;
}) {
  const s = STYLE[status];
  return (
    <button
      type="button"
      title={s.label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(NEXT[status]);
      }}
      className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all hover:scale-110 ${s.cls}`}
    >
      {s.glyph}
    </button>
  );
}
