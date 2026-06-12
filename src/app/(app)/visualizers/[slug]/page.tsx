"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { visualizerBySlug, type Frame, type Role } from "@/lib/visualizers";

const ROLE_COLORS: Record<Role, string> = {
  compare: "bg-amber-400",
  swap: "bg-red-400",
  sorted: "bg-lime-400",
  pivot: "bg-violet-400",
  window: "bg-lime-400",
  best: "bg-lime-400",
};

const GRID_COLORS: Record<number, string> = {
  0: "bg-zinc-200 bg-zinc-800",
  1: "bg-zinc-9000 dark:bg-zinc-600",
  2: "bg-lime-400/70",
  3: "bg-amber-300",
  4: "bg-violet-400",
  5: "bg-lime-400",
  6: "bg-lime-300",
};

const SPEEDS = [
  { label: "0.5×", ms: 600 },
  { label: "1×", ms: 300 },
  { label: "2×", ms: 140 },
  { label: "4×", ms: 60 },
];

export default function VisualizerPlayerPage() {
  const params = useParams<{ slug: string }>();
  const viz = visualizerBySlug.get(params.slug);

  const [size, setSize] = useState(viz?.inputKind === "grid" ? 12 : 18);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const regenerate = useCallback(() => {
    if (!viz) return;
    setFrames(viz.gen(size));
    setIdx(0);
    setPlaying(false);
  }, [viz, size]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setIdx((i) => {
        if (i >= frames.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, SPEEDS[speed].ms);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, speed, frames.length]);

  if (!viz) {
    return (
      <div className="p-8 text-sm text-zinc-500">
        Visualizer not found.{" "}
        <Link href="/visualizers" className="text-lime-400 hover:underline">
          All visualizers
        </Link>
      </div>
    );
  }

  const frame = frames[idx];
  const maxVal = frame?.kind === "array" ? Math.max(...frame.arr.map(Math.abs), 1) : 1;

  const ctl =
    "rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors hover:border-lime-300 disabled:opacity-40 border-zinc-800";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/visualizers"
        className="mb-4 inline-block text-xs font-medium text-zinc-500 transition-colors hover:text-lime-400"
      >
        ← All visualizers
      </Link>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-3xl">{viz.icon}</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{viz.name}</h1>
          <p className="text-sm text-zinc-500">{viz.desc}</p>
        </div>
      </div>

      {/* Stage */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 border-zinc-800 bg-zinc-900/40">
        {frame?.kind === "array" && (
          <div className="flex h-56 items-end justify-center gap-1">
            {frame.arr.map((v, i) => {
              const role = frame.colors[i];
              const pointer = frame.pointers[i];
              const h = Math.max(6, (Math.abs(v) / maxVal) * 180);
              return (
                <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ maxWidth: 40 }}>
                  {pointer && (
                    <span className="text-[10px] font-bold text-violet-500">{pointer}</span>
                  )}
                  <div
                    className={`w-full rounded-t-md transition-all duration-150 ${
                      role ? ROLE_COLORS[role] : v < 0 ? "bg-zinc-400 dark:bg-zinc-600" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                    style={{ height: h }}
                  />
                  <span className="text-[9px] tabular-nums text-zinc-400">{v}</span>
                </div>
              );
            })}
          </div>
        )}

        {frame?.kind === "grid" && (
          <div className="flex justify-center">
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${frame.grid[0].length}, minmax(0,1fr))`, width: "min(100%, 420px)" }}
            >
              {frame.grid.flatMap((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-[3px] transition-colors duration-150 ${GRID_COLORS[cell]}`}
                  />
                )),
              )}
            </div>
          </div>
        )}

        <p className="mt-4 min-h-5 text-center text-sm font-medium">{frame?.msg}</p>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button className={ctl} onClick={() => setIdx(0)} disabled={idx === 0}>
            ⏮
          </button>
          <button className={ctl} onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            ◀ Step
          </button>
          <button
            className="rounded-lg bg-lime-400 px-5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-lime-600"
            onClick={() => {
              if (idx >= frames.length - 1) setIdx(0);
              setPlaying(!playing);
            }}
          >
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            className={ctl}
            onClick={() => setIdx((i) => Math.min(frames.length - 1, i + 1))}
            disabled={idx >= frames.length - 1}
          >
            Step ▶
          </button>
          <button className={ctl} onClick={regenerate}>
            🎲 Randomize
          </button>
          <select
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs border-zinc-800"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            {SPEEDS.map((s, i) => (
              <option key={s.label} value={i}>
                {s.label}
              </option>
            ))}
          </select>
          {viz.inputKind === "array" && (
            <select
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs border-zinc-800"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {[10, 14, 18, 24, 30].map((s) => (
                <option key={s} value={s}>
                  {s} items
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Scrubber */}
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.max(0, frames.length - 1)}
            value={idx}
            onChange={(e) => {
              setPlaying(false);
              setIdx(Number(e.target.value));
            }}
            className="w-full accent-lime-400"
          />
          <span className="shrink-0 text-[11px] tabular-nums text-zinc-500">
            {idx + 1}/{frames.length}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-500">
        {viz.inputKind === "array" ? (
          <>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-amber-400" /> comparing</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-red-400" /> writing/swap</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-violet-400" /> pivot/key</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-lime-400" /> active range</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-lime-400" /> done/best</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-zinc-9000" /> wall</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-amber-300" /> frontier</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-lime-400/70" /> visited</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded-sm bg-lime-400" /> start/end/path</span>
          </>
        )}
      </div>
    </div>
  );
}
