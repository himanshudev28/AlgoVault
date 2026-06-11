"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { questionById, type Tag } from "@/data/questions";
import { CustomQuestion, EMPTY_PROGRESS, ProgressRow, Status } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import { DifficultyBadge, PlatformBadge, Spinner } from "@/components/ui";
import { Stars } from "@/components/Stars";
import { StatusButton } from "@/components/StatusButton";
import { RunPanel } from "@/components/RunPanel";

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
];

const AI_STAGES = [
  { key: "hint", label: "💡 Hint", desc: "a gentle nudge" },
  { key: "approach", label: "🧭 Approach", desc: "brute force → optimal" },
  { key: "complexity", label: "⏱ Complexity", desc: "+ edge cases" },
  { key: "solution", label: "✅ Full solution", desc: "C++ & Python" },
] as const;

const AI_EXTRAS = [
  { key: "simpler", label: "🪄 Explain simpler" },
  { key: "hindi", label: "🇮🇳 Hinglish" },
] as const;

function platformFromLink(link: string): string {
  if (link.includes("leetcode.com")) return "LeetCode";
  if (link.includes("geeksforgeeks.org")) return "GFG";
  return "Custom";
}

export default function ProblemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const staticQ = questionById.get(id);
  const [customQ, setCustomQ] = useState<CustomQuestion | null>(null);
  const [customLoading, setCustomLoading] = useState(!staticQ);

  useEffect(() => {
    if (staticQ) return;
    fetch("/api/sheets")
      .then((r) => r.json())
      .then((d) => setCustomQ(d.questions?.find((q: CustomQuestion) => q.id === id) ?? null))
      .finally(() => setCustomLoading(false));
  }, [id, staticQ]);

  const question = staticQ
    ? { ...staticQ, platform: staticQ.platform as string }
    : customQ
      ? {
          id,
          title: customQ.title,
          topic: customQ.topic,
          tag: customQ.tag as Tag,
          platform: platformFromLink(customQ.link),
          link: customQ.link,
          note: customQ.note,
        }
      : null;

  const [row, setRow] = useState<ProgressRow>({ questionId: id, ...EMPTY_PROGRESS });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [aiOpen, setAiOpen] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((r) => r.json())
      .then((data) => {
        const found = data.rows?.find((r: ProgressRow) => r.questionId === id);
        if (found) setRow(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const save = (patch: Partial<ProgressRow>, debounce = 0) => {
    setRow((prev) => ({ ...prev, ...patch }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: id, ...patch }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRow(data.row);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("idle");
      }
    }, debounce);
  };

  const askAi = async (stage: string) => {
    if (aiOpen[stage]) {
      setAiOpen((prev) => {
        const next = { ...prev };
        delete next[stage];
        return next;
      });
      return;
    }
    setAiLoading(stage);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, stage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      setAiOpen((prev) => ({ ...prev, [stage]: data.text }));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setAiLoading(null);
    }
  };

  if (!question) {
    if (customLoading) {
      return (
        <div className="flex h-64 items-center justify-center text-zinc-400">
          <Spinner />
        </div>
      );
    }
    return (
      <div className="p-8 text-sm text-zinc-500">
        Problem not found.{" "}
        <Link href="/problems" className="text-emerald-500 hover:underline">
          Back to problems
        </Link>
      </div>
    );
  }

  const card =
    "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40";
  const textarea =
    "w-full resize-y rounded-xl border border-zinc-300 bg-white px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/problems"
        className="mb-4 inline-block text-xs font-medium text-zinc-500 transition-colors hover:text-emerald-500"
      >
        ← All problems
      </Link>

      {/* Header */}
      <div className={`${card} mb-4`}>
        <div className="flex flex-wrap items-start gap-3">
          <StatusButton
            status={row.status}
            onChange={(s: Status) => save({ status: s })}
            size="size-7"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight">{question.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <DifficultyBadge tag={question.tag} />
              <PlatformBadge platform={question.platform} />
              <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 dark:border-zinc-800">
                {question.topic}
              </span>
              {question.link && (
                <a
                  href={question.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-emerald-500 hover:underline"
                >
                  Solve on {question.platform} ↗
                </a>
              )}
            </div>
            {question.note && (
              <p className="mt-2 text-xs text-zinc-500">Key idea on file: {question.note}</p>
            )}
          </div>
          <span className="text-[11px] text-zinc-400">
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : ""}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800/60">
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            Confidence
            <Stars value={row.confidence} onChange={(v) => save({ confidence: v })} />
          </label>
          <label className="flex items-center gap-2 text-xs text-zinc-500">
            Attempts
            <span className="inline-flex items-center gap-1.5">
              <button
                onClick={() => save({ attempts: Math.max(0, row.attempts - 1) })}
                className="size-6 rounded-md border border-zinc-300 text-zinc-500 hover:border-emerald-400 dark:border-zinc-700"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {row.attempts}
              </span>
              <button
                onClick={() => save({ attempts: row.attempts + 1 })}
                className="size-6 rounded-md border border-zinc-300 text-zinc-500 hover:border-emerald-400 dark:border-zinc-700"
              >
                +
              </button>
            </span>
          </label>
          <button
            onClick={() => save({ bookmark: !row.bookmark })}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              row.bookmark
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700"
            }`}
          >
            🔖 {row.bookmark ? "Bookmarked" : "Bookmark"}
          </button>
          <button
            onClick={() => save({ needsRevision: !row.needsRevision })}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              row.needsRevision
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-zinc-300 text-zinc-500 dark:border-zinc-700"
            }`}
          >
            🔁 {row.needsRevision ? "Marked for revision" : "Mark for revision"}
          </button>
        </div>
      </div>

      {/* Problem statement (only for URL-fetched custom questions) */}
      {customQ?.description && (
        <div className={`${card} mb-4`}>
          <details open>
            <summary className="cursor-pointer select-none font-semibold">
              Problem Statement
            </summary>
            <div
              className="prose-problem mt-3 max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{
                __html: customQ.description.startsWith("<")
                  ? customQ.description
                  : customQ.description.replace(/\n/g, "<br>"),
              }}
            />
          </details>
        </div>
      )}

      {/* AI explanations */}
      <div className={`${card} mb-4`}>
        <h2 className="font-semibold">Understand it — without spoiling it</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Reveal help in stages. Try the problem first, then work down the ladder.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AI_STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => askAi(s.key)}
              disabled={aiLoading !== null}
              title={s.desc}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                aiOpen[s.key]
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-300 hover:border-emerald-400 dark:border-zinc-700"
              }`}
            >
              {aiLoading === s.key && <Spinner className="size-3" />}
              {s.label}
            </button>
          ))}
          <span className="mx-1 hidden w-px bg-zinc-200 sm:block dark:bg-zinc-800" />
          {AI_EXTRAS.map((s) => (
            <button
              key={s.key}
              onClick={() => askAi(s.key)}
              disabled={aiLoading !== null}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                aiOpen[s.key]
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-zinc-300 hover:border-emerald-400 dark:border-zinc-700"
              }`}
            >
              {aiLoading === s.key && <Spinner className="size-3" />}
              {s.label}
            </button>
          ))}
        </div>
        {aiError && <p className="mt-3 text-xs text-red-500">{aiError}</p>}
        {[...AI_STAGES, ...AI_EXTRAS]
          .filter((s) => aiOpen[s.key])
          .map((s) => (
            <div
              key={s.key}
              className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
            >
              <div className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {s.label}
              </div>
              <div
                className="prose-ai"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(aiOpen[s.key]) }}
              />
            </div>
          ))}
      </div>

      {/* Notes */}
      <div className={`${card} mb-4`}>
        <h2 className="mb-1 font-semibold">My notes</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Intuition, pattern, mistakes you made — future-you will thank you. Autosaves.
        </p>
        {loading ? (
          <div className="flex h-24 items-center justify-center text-zinc-400">
            <Spinner />
          </div>
        ) : (
          <textarea
            className={`${textarea} min-h-28`}
            placeholder={
              question.note
                ? `e.g. "${question.note}" — what's YOUR one-line takeaway?`
                : "What's YOUR one-line takeaway?"
            }
            value={row.note}
            onChange={(e) => save({ note: e.target.value }, 800)}
          />
        )}
      </div>

      {/* Solution */}
      <div className={card}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">My solution</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Paste your accepted code — this is your revision gold.
            </p>
          </div>
          <select
            className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
            value={row.solutionLanguage}
            onChange={(e) => save({ solutionLanguage: e.target.value })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="flex h-24 items-center justify-center text-zinc-400">
            <Spinner />
          </div>
        ) : (
          <>
            <textarea
              className={`${textarea} min-h-56 font-mono text-[13px] leading-relaxed`}
              spellCheck={false}
              placeholder="// your accepted solution"
              value={row.solutionCode}
              onChange={(e) => save({ solutionCode: e.target.value }, 800)}
            />
            <RunPanel code={row.solutionCode} language={row.solutionLanguage} />
          </>
        )}
      </div>
    </div>
  );
}
