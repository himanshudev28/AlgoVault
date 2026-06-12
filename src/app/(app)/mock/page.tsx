"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS, TOPICS, type Question } from "@/data/questions";
import { useProgress } from "@/lib/useProgress";
import { DifficultyBadge, PlatformBadge } from "@/components/ui";

type Phase = "setup" | "running" | "review";
type Verdict = "solved" | "skipped" | null;

const COUNTS = [2, 3, 4, 5];
const DURATIONS = [30, 45, 60, 90];

function pick(pool: Question[], n: number): Question[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

function fmtClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MockInterviewPage() {
  const { update } = useProgress();

  const [phase, setPhase] = useState<Phase>("setup");
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [count, setCount] = useState(3);
  const [minutes, setMinutes] = useState(45);
  const [hardMode, setHardMode] = useState(false);

  const [problems, setProblems] = useState<Question[]>([]);
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pool = useMemo(() => {
    let p = QUESTIONS;
    if (topics.size > 0) p = p.filter((q) => topics.has(q.topic));
    if (hardMode) p = p.filter((q) => q.level >= 3);
    return p;
  }, [topics, hardMode]);

  const start = () => {
    const qs = pick(pool, Math.min(count, pool.length));
    setProblems(qs);
    setVerdicts({});
    setSecondsLeft(minutes * 60);
    setPhase("running");
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("review");
  };

  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setPhase("review");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Persist solves when the session ends.
  const committed = useRef(false);
  useEffect(() => {
    if (phase !== "review" || committed.current) return;
    committed.current = true;
    for (const q of problems) {
      if (verdicts[q.id] === "solved") update(q.id, { status: "solved" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const card =
    "rounded-2xl border border-zinc-800 bg-zinc-900 border-zinc-800 bg-zinc-900/40";
  const btn =
    "rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lime-600 disabled:opacity-50";
  const chip = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "border-lime-400 bg-lime-400/10 text-lime-600 dark:text-lime-300"
        : "border-zinc-800 text-zinc-600 hover:border-zinc-400 border-zinc-800 text-zinc-400"
    }`;

  // ─── Setup ───
  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">Mock Interview</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-500">
          Random problems, a real timer, no hints — just like the actual thing. Results are
          saved to your progress at the end.
        </p>

        <div className={`${card} space-y-6 p-6`}>
          <div>
            <h2 className="mb-2 text-sm font-semibold">Topics ({topics.size === 0 ? "all" : topics.size} selected)</h2>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  className={chip(topics.has(t))}
                  onClick={() =>
                    setTopics((prev) => {
                      const next = new Set(prev);
                      if (next.has(t)) next.delete(t);
                      else next.add(t);
                      return next;
                    })
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-8">
            <div>
              <h2 className="mb-2 text-sm font-semibold">Problems</h2>
              <div className="flex gap-1.5">
                {COUNTS.map((c) => (
                  <button key={c} className={chip(count === c)} onClick={() => setCount(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold">Duration</h2>
              <div className="flex gap-1.5">
                {DURATIONS.map((d) => (
                  <button key={d} className={chip(minutes === d)} onClick={() => setMinutes(d)}>
                    {d}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold">Difficulty</h2>
              <button className={chip(hardMode)} onClick={() => setHardMode(!hardMode)}>
                {hardMode ? "Medium+ only ✓" : "Include easy"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-zinc-800 pt-5 border-zinc-800/60">
            <button className={btn} onClick={start} disabled={pool.length === 0}>
              Start interview →
            </button>
            <span className="text-xs text-zinc-500">{pool.length} problems in the pool</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Running ───
  if (phase === "running") {
    const answered = problems.filter((q) => verdicts[q.id]).length;
    const low = secondsLeft <= 300;
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interview in progress</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {answered}/{problems.length} marked · solutions &amp; AI help are off-limits 😉
            </p>
          </div>
          <div
            className={`rounded-2xl border px-5 py-3 font-mono text-2xl font-bold tabular-nums ${
              low
                ? "border-red-500/40 bg-red-500/10 text-red-500"
                : "border-zinc-800"
            }`}
          >
            {fmtClock(secondsLeft)}
          </div>
        </div>

        <div className="space-y-3">
          {problems.map((q, i) => {
            const v = verdicts[q.id];
            return (
              <div key={q.id} className={`${card} p-5`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">Q{i + 1}</span>
                  <span className="font-semibold">{q.title}</span>
                  <DifficultyBadge tag={q.tag} />
                  <PlatformBadge platform={q.platform} />
                  <a
                    href={q.link}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-xs font-medium text-lime-400 hover:underline"
                  >
                    Open problem ↗
                  </a>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className={chip(v === "solved")}
                    onClick={() => setVerdicts((p) => ({ ...p, [q.id]: "solved" }))}
                  >
                    ✅ Solved it
                  </button>
                  <button
                    className={chip(v === "skipped")}
                    onClick={() => setVerdicts((p) => ({ ...p, [q.id]: "skipped" }))}
                  >
                    ⏭ Couldn&apos;t solve
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button className={`${btn} mt-6 bg-zinc-700 hover:bg-zinc-800`} onClick={finish}>
          End interview early
        </button>
      </div>
    );
  }

  // ─── Review ───
  const solvedCount = problems.filter((q) => verdicts[q.id] === "solved").length;
  const usedSec = minutes * 60 - secondsLeft;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">
        {solvedCount === problems.length
          ? "Perfect round! 🎉"
          : solvedCount > 0
            ? "Interview done 👏"
            : "Tough round — that's how you learn 💪"}
      </h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500">
        {solvedCount}/{problems.length} solved in {fmtClock(usedSec)}. Solved problems were added
        to your progress.
      </p>

      <div className="space-y-3">
        {problems.map((q, i) => {
          const v = verdicts[q.id];
          return (
            <div key={q.id} className={`${card} flex flex-wrap items-center gap-2 p-4`}>
              <span className="text-lg">{v === "solved" ? "✅" : "❌"}</span>
              <span className="text-xs font-bold text-zinc-400">Q{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{q.title}</span>
              <DifficultyBadge tag={q.tag} />
              {v !== "solved" && (
                <a
                  href={`/problems/${q.id}`}
                  className="text-xs font-medium text-lime-400 hover:underline"
                >
                  Study it →
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className={btn}
          onClick={() => {
            committed.current = false;
            setPhase("setup");
          }}
        >
          New interview
        </button>
      </div>
    </div>
  );
}
