"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { questionById, type Tag } from "@/data/questions";
import { useProgress } from "@/lib/useProgress";
import { useSheets } from "@/lib/useSheets";
import { ProgressRow } from "@/lib/types";
import { DifficultyBadge, PlatformBadge, Spinner } from "@/components/ui";

interface LookupQ {
  id: number;
  title: string;
  link: string;
  tag: string;
  platform: string;
  note: string;
}

const RATINGS = [
  { quality: 1, label: "Again", hint: "Forgot it", cls: "border-red-500/40 text-red-500 hover:bg-red-500/10" },
  { quality: 3, label: "Hard", hint: "Barely recalled", cls: "border-orange-500/40 text-orange-500 hover:bg-orange-500/10" },
  { quality: 4, label: "Good", hint: "Recalled with effort", cls: "border-lime-400/40 text-lime-400 hover:bg-lime-400/10" },
  { quality: 5, label: "Easy", hint: "Instant recall", cls: "border-lime-500/40 text-lime-500 hover:bg-lime-500/10" },
];

function fmtDue(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  const days = Math.floor((date.getTime() - Date.now()) / 86400000);
  if (days < -1) return `${-days} days overdue`;
  if (days < 0) return "overdue";
  if (days === 0) return "due today";
  return `due in ${days + 1}d`;
}

export default function RevisionPage() {
  const { map, loading, error, update } = useProgress();
  const { questions: customQs } = useSheets();
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const lookup = useMemo(() => {
    const m = new Map<number, LookupQ>();
    for (const [qid, q] of questionById)
      m.set(qid, {
        id: q.id,
        title: q.title,
        link: q.link,
        tag: q.tag,
        platform: q.platform,
        note: q.note,
      });
    for (const cq of customQs)
      m.set(cq.id, {
        id: cq.id,
        title: cq.title,
        link: cq.link,
        tag: cq.tag,
        note: cq.note,
        platform: cq.link.includes("leetcode.com")
          ? "LeetCode"
          : cq.link.includes("geeksforgeeks.org")
            ? "GFG"
            : "Custom",
      });
    return m;
  }, [customQs]);

  const { due, flagged, lowConfidence } = useMemo(() => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const due: ProgressRow[] = [];
    const flagged: ProgressRow[] = [];
    const lowConfidence: ProgressRow[] = [];
    for (const row of map.values()) {
      if (!lookup.has(row.questionId)) continue;
      const isDue = row.nextReviewAt && new Date(row.nextReviewAt) <= endOfToday;
      if (isDue && row.status === "solved") due.push(row);
      else if (row.needsRevision) flagged.push(row);
      else if (row.status === "solved" && row.confidence != null && row.confidence <= 2)
        lowConfidence.push(row);
    }
    due.sort(
      (a, b) => new Date(a.nextReviewAt!).getTime() - new Date(b.nextReviewAt!).getTime(),
    );
    return { due, flagged, lowConfidence };
  }, [map, lookup]);

  const rate = async (questionId: number, quality: number) => {
    setReviewing(true);
    try {
      const res = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, quality }),
      });
      if (res.ok) {
        const { row } = await res.json();
        // Reflect new schedule locally (update() would re-PATCH; set via its optimistic path)
        update(questionId, {
          nextReviewAt: row.nextReviewAt,
          easeFactor: row.easeFactor,
          intervalDays: row.intervalDays,
          repetitions: row.repetitions,
          lastRevisedAt: row.lastRevisedAt,
          confidence: row.confidence,
        });
        setDoneCount((c) => c + 1);
      }
    } finally {
      setReviewing(false);
      setActive(null);
      setRevealed(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading your queue…
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-sm text-red-500">Couldn&apos;t load queue: {error}</div>;
  }

  const card =
    "rounded-2xl border border-zinc-800 bg-zinc-900 border-zinc-800 bg-zinc-900/40";

  const renderItem = (row: ProgressRow, dueLabel?: boolean) => {
    const q = lookup.get(row.questionId)!;
    const isActive = active === row.questionId;
    return (
      <li key={row.questionId} className="border-t border-zinc-800 first:border-0 border-zinc-800/60">
        <div
          className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/50 dark:hover:bg-zinc-900"
          onClick={() => {
            setActive(isActive ? null : row.questionId);
            setRevealed(false);
          }}
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{q.title}</span>
          {dueLabel && (
            <span className="text-[11px] font-medium text-amber-500">
              {fmtDue(row.nextReviewAt)}
            </span>
          )}
          <span className="hidden sm:inline-flex">
            <PlatformBadge platform={q.platform} />
          </span>
          <DifficultyBadge tag={q.tag as Tag} />
          <span className="text-xs text-zinc-400">{isActive ? "▲" : "▼"}</span>
        </div>

        {isActive && (
          <div className="border-t border-zinc-800 bg-zinc-900/40 px-4 py-4/40">
            <p className="text-xs text-zinc-500">
              <strong className="text-zinc-700 text-zinc-300">Active recall:</strong> solve it
              in your head (or on the platform) first — then reveal your notes and rate yourself.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {q.link && (
                <a
                  href={q.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors hover:border-lime-300 border-zinc-800"
                >
                  Open on {q.platform} ↗
                </a>
              )}
              <button
                onClick={() => setRevealed(!revealed)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors hover:border-lime-300 border-zinc-800"
              >
                {revealed ? "Hide" : "Reveal"} my notes & solution
              </button>
              <Link
                href={`/problems/${q.id}`}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium transition-colors hover:border-lime-300 border-zinc-800"
              >
                Full problem page →
              </Link>
            </div>

            {revealed && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm border-zinc-800 bg-zinc-900">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    My note
                  </div>
                  {row.note ? (
                    <p className="whitespace-pre-wrap">{row.note}</p>
                  ) : (
                    <p className="text-zinc-400">
                      No note yet — sheet hint: <em>{q.note}</em>
                    </p>
                  )}
                </div>
                {row.solutionCode && (
                  <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-200 border-zinc-800">
                    {row.solutionCode}
                  </pre>
                )}
              </div>
            )}

            <div className="mt-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                How well did you recall it?
              </div>
              <div className="flex flex-wrap gap-2">
                {RATINGS.map((r) => (
                  <button
                    key={r.quality}
                    disabled={reviewing}
                    onClick={() => rate(row.questionId, r.quality)}
                    title={r.hint}
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${r.cls}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Revision</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Spaced repetition — rate your recall and the schedule adapts (SM-2, Anki-style).
        </p>
        {doneCount > 0 && (
          <p className="mt-2 inline-block rounded-lg bg-lime-400/10 px-3 py-1.5 text-xs font-medium text-lime-600 dark:text-lime-300">
            🎉 {doneCount} review{doneCount > 1 ? "s" : ""} done this session
          </p>
        )}
      </div>

      <section className={`${card} mb-4 overflow-hidden`}>
        <div className="flex items-center gap-2 px-4 py-3">
          <h2 className="font-semibold">Due for review</h2>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {due.length}
          </span>
        </div>
        {due.length === 0 ? (
          <p className="border-t border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500 border-zinc-800/60">
            Nothing due — you&apos;re ahead of the forgetting curve. 🧠
          </p>
        ) : (
          <ul>{due.map((r) => renderItem(r, true))}</ul>
        )}
      </section>

      {flagged.length > 0 && (
        <section className={`${card} mb-4 overflow-hidden`}>
          <div className="flex items-center gap-2 px-4 py-3">
            <h2 className="font-semibold">Flagged for revision</h2>
            <span className="rounded-full bg-zinc-9000/15 px-2 py-0.5 text-xs font-semibold text-zinc-500">
              {flagged.length}
            </span>
          </div>
          <ul>{flagged.map((r) => renderItem(r))}</ul>
        </section>
      )}

      {lowConfidence.length > 0 && (
        <section className={`${card} overflow-hidden`}>
          <div className="flex items-center gap-2 px-4 py-3">
            <h2 className="font-semibold">Low confidence</h2>
            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-500">
              {lowConfidence.length}
            </span>
          </div>
          <ul>{lowConfidence.map((r) => renderItem(r))}</ul>
        </section>
      )}
    </div>
  );
}
