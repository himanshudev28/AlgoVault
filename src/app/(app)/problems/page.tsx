"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QUESTIONS, TAGS, TOPICS, type Tag } from "@/data/questions";
import { useProgress } from "@/lib/useProgress";
import { useSheets } from "@/lib/useSheets";
import {
  DifficultyBadge,
  PlatformBadge,
  Spinner,
  TAG_DOT,
  BookmarkIcon,
  RepeatIcon,
  ExternalLinkIcon,
} from "@/components/ui";
import { Stars } from "@/components/Stars";
import { StatusButton } from "@/components/StatusButton";
import { AddQuestionPanel } from "@/components/AddQuestionPanel";

type StatusFilter = "All" | "Solved" | "Attempting" | "Unsolved";

function looksLikeUrl(s: string) {
  return s.startsWith("http://") || s.startsWith("https://");
}

function titleFromUrl(url: string): string {
  try {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  } catch {
    return url;
  }
}

function displayTitle(q: { title: string; link: string }): string {
  const t = q.title.trim();
  if (!t || looksLikeUrl(t)) return q.link ? titleFromUrl(q.link) : "Untitled";
  return t;
}

// ─── Built-in problems tab ─────────────────────────────────────────────────────
function BuiltinTab() {
  const params = useSearchParams();
  const { map, loading, error, update, getRow } = useProgress();

  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState(params.get("topic") ?? "All");
  const [level, setLevel] = useState<"All" | Tag>((params.get("level") as Tag) ?? "All");
  const [status, setStatus] = useState<StatusFilter>(
    (params.get("status") as StatusFilter) ?? "All",
  );
  const [onlyBookmarked, setOnlyBookmarked] = useState(params.get("bookmarked") === "1");
  const [onlyRevision, setOnlyRevision] = useState(params.get("revision") === "1");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      QUESTIONS.filter((q) => {
        const row = getRow(q.id);
        if (topic !== "All" && q.topic !== topic) return false;
        if (level !== "All" && q.tag !== level) return false;
        if (status === "Solved" && row.status !== "solved") return false;
        if (status === "Attempting" && row.status !== "attempting") return false;
        if (status === "Unsolved" && row.status === "solved") return false;
        if (onlyBookmarked && !row.bookmark) return false;
        if (onlyRevision && !row.needsRevision) return false;
        if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, topic, level, status, onlyBookmarked, onlyRevision, search],
  );

  const grouped = useMemo(() => {
    const g = new Map<string, typeof filtered>();
    for (const q of filtered) {
      if (!g.has(q.topic)) g.set(q.topic, []);
      g.get(q.topic)!.push(q);
    }
    return g;
  }, [filtered]);

  const totalSolved = useMemo(
    () => QUESTIONS.filter((q) => getRow(q.id).status === "solved").length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map],
  );
  const pct = Math.round((totalSolved / QUESTIONS.length) * 100);

  const tagCounts = useMemo(() => {
    const counts = new Map<Tag, { total: number; solved: number }>();
    for (const t of TAGS) counts.set(t, { total: 0, solved: 0 });
    for (const q of QUESTIONS) {
      const c = counts.get(q.tag)!;
      c.total++;
      if (getRow(q.id).status === "solved") c.solved++;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const select =
    "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 outline-none transition-colors focus:border-lime-400";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading your progress…
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-sm text-red-500">Couldn&apos;t load progress: {error}</div>;
  }

  return (
    <>
      {/* Stats header */}
      <div className="mb-5">
        <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
          <span className="font-medium">
            {totalSolved} / {QUESTIONS.length} solved
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-lime-400 to-lime-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {TAGS.map((t) => {
            const c = tagCounts.get(t)!;
            return (
              <button
                key={t}
                onClick={() => setLevel(level === t ? "All" : t)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
                  level === t
                    ? "border-lime-400 bg-lime-400/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <span className={`size-1.5 rounded-full ${TAG_DOT[t]}`} />
                {t} {c.solved}/{c.total}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 border-y border-zinc-200 dark:border-zinc-800 bg-zinc-950/95 px-4 py-2.5 backdrop-blur md:top-0 md:mx-0 md:rounded-xl md:border">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="w-44 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-lime-400"
            placeholder="Search problems…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={select} value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option>All</option>
            {TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            className={select}
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option>All</option>
            <option>Solved</option>
            <option>Attempting</option>
            <option>Unsolved</option>
          </select>
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              onlyBookmarked
                ? "border-lime-400 bg-lime-400/10 text-lime-400"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
            }`}
          >
            <BookmarkIcon filled={onlyBookmarked} className="size-3.5" />
            Bookmarked
          </button>
          <button
            onClick={() => setOnlyRevision(!onlyRevision)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              onlyRevision
                ? "border-lime-400 bg-lime-400/10 text-lime-400"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500"
            }`}
          >
            <RepeatIcon className="size-3.5" />
            Revise
          </button>
          <span className="ml-auto text-xs text-zinc-500">{filtered.length} shown</span>
        </div>
      </div>

      {/* Topic groups */}
      <div className="space-y-3">
        {grouped.size === 0 && (
          <p className="py-16 text-center text-sm text-zinc-500">
            No problems match these filters.
          </p>
        )}
        {[...grouped.entries()].map(([topicName, questions]) => {
          const solvedHere = questions.filter((q) => getRow(q.id).status === "solved").length;
          const isCollapsed = collapsed.has(topicName);
          return (
            <section
              key={topicName}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40"
            >
              <button
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev);
                    if (next.has(topicName)) next.delete(topicName);
                    else next.add(topicName);
                    return next;
                  })
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <span
                  className={`text-xs text-zinc-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                >
                  ▶
                </span>
                <span className="font-semibold">{topicName}</span>
                <span className="text-xs text-zinc-500">
                  {solvedHere}/{questions.length}
                </span>
                <div className="ml-auto hidden h-1.5 w-28 overflow-hidden rounded-full bg-zinc-200 sm:block bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-lime-400 transition-all"
                    style={{ width: `${(solvedHere / questions.length) * 100}%` }}
                  />
                </div>
              </button>
              {!isCollapsed && (
                <ul className="divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800/60 border-zinc-200 dark:border-zinc-800/60">
                  {questions.map((q) => {
                    const row = getRow(q.id);
                    return (
                      <li key={q.id} className="group">
                        <div className="flex items-center gap-2.5 px-4 py-2.5">
                          <StatusButton
                            status={row.status}
                            onChange={(s) => update(q.id, { status: s })}
                          />
                          <Link
                            href={`/problems/${q.id}`}
                            className={`min-w-0 flex-1 truncate text-sm font-medium transition-colors hover:text-lime-400 ${
                              row.status === "solved" ? "text-zinc-400 text-zinc-500" : ""
                            }`}
                          >
                            {q.title}
                          </Link>
                          <span className="hidden md:inline-flex">
                            <Stars
                              value={row.confidence}
                              onChange={(v) => update(q.id, { confidence: v })}
                              size="text-sm"
                            />
                          </span>
                          <span className="hidden sm:inline-flex">
                            <PlatformBadge platform={q.platform} />
                          </span>
                          <DifficultyBadge tag={q.tag} />
                          <button
                            title={row.bookmark ? "Remove bookmark" : "Bookmark"}
                            onClick={() => update(q.id, { bookmark: !row.bookmark })}
                            className={`transition-all hover:scale-110 ${
                              row.bookmark
                                ? "text-amber-500"
                                : "text-zinc-300 hover:text-zinc-500"
                            }`}
                          >
                            <BookmarkIcon filled={row.bookmark} className="size-4" />
                          </button>
                          <button
                            title={row.needsRevision ? "Unmark for revision" : "Mark for revision"}
                            onClick={() => update(q.id, { needsRevision: !row.needsRevision })}
                            className={`transition-all hover:scale-110 ${
                              row.needsRevision
                                ? "text-lime-400"
                                : "text-zinc-300 hover:text-zinc-500"
                            }`}
                          >
                            <RepeatIcon className="size-4" />
                          </button>
                          <a
                            href={q.link}
                            target="_blank"
                            rel="noreferrer"
                            title={`Open on ${q.platform}`}
                            className="text-zinc-400 transition-colors hover:text-lime-400"
                          >
                            <ExternalLinkIcon className="size-3.5" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

// ─── My Imports tab ────────────────────────────────────────────────────────────
function ImportsTab() {
  const { sheets, questions, loading, error, refresh } = useSheets();
  const { map, update, getRow } = useProgress();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [addingTo, setAddingTo] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      questions.filter(
        (q) => !search || q.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [questions, search],
  );

  const bySheet = useMemo(() => {
    const m = new Map<number, typeof filtered>();
    for (const q of filtered) {
      if (!m.has(q.sheetId)) m.set(q.sheetId, []);
      m.get(q.sheetId)!.push(q);
    }
    return m;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading imports…
      </div>
    );
  }
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 p-10 text-center border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="mb-2 text-3xl">📋</div>
        <p className="text-sm font-medium">No imported problems yet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">
          Go to{" "}
          <Link href="/sheets" className="text-lime-400 hover:underline">
            My Sheets
          </Link>{" "}
          to import a CSV, PDF, or paste a LeetCode / GFG URL.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          className="w-52 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-lime-400"
          placeholder="Search imported problems…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-xs text-zinc-500">{filtered.length} problems</span>
      </div>

      <div className="space-y-3">
        {sheets.map((sheet) => {
          const qs = bySheet.get(sheet.id) ?? [];
          if (qs.length === 0 && search) return null;
          const sheetQs = questions.filter((q) => q.sheetId === sheet.id);
          const solved = sheetQs.filter((q) => map.get(q.id)?.status === "solved").length;
          const isCollapsed = collapsed.has(sheet.id);

          return (
            <section
              key={sheet.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40"
            >
              {/* Sheet header */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() =>
                    setCollapsed((prev) => {
                      const next = new Set(prev);
                      if (next.has(sheet.id)) next.delete(sheet.id);
                      else next.add(sheet.id);
                      return next;
                    })
                  }
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span
                    className={`text-xs text-zinc-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                  >
                    ▶
                  </span>
                  <span className="font-semibold">{sheet.name}</span>
                  <span className="text-xs text-zinc-500">
                    {solved}/{sheetQs.length}
                  </span>
                  <div className="ml-auto hidden h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 sm:block bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-lime-400 transition-all"
                      style={{
                        width: `${sheetQs.length ? (solved / sheetQs.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </button>
                <Link
                  href={`/sheets/${sheet.id}`}
                  className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-lime-400"
                >
                  Manage →
                </Link>
                <button
                  onClick={() => setAddingTo(addingTo === sheet.id ? null : sheet.id)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    addingTo === sheet.id
                      ? "border-lime-400 bg-lime-400/10 text-lime-400"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-lime-400"
                  }`}
                >
                  + Add
                </button>
              </div>

              {/* Add panel inline */}
              {addingTo === sheet.id && (
                <div className="border-t border-zinc-100 p-4 border-zinc-200 dark:border-zinc-800/60">
                  <AddQuestionPanel
                    sheetId={sheet.id}
                    existingQuestions={sheetQs}
                    onSaved={() => { refresh(); }}
                    onClose={() => setAddingTo(null)}
                  />
                </div>
              )}

              {/* Question rows */}
              {!isCollapsed && qs.length > 0 && (
                <ul className="divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800/60 border-zinc-200 dark:border-zinc-800/60">
                  {qs.map((q) => {
                    const row = getRow(q.id);
                    return (
                      <li key={q.id} className="group">
                        <div className="flex items-center gap-2.5 px-4 py-2.5">
                          <StatusButton
                            status={row.status}
                            onChange={(s) => update(q.id, { status: s })}
                          />
                          <Link
                            href={`/problems/${q.id}`}
                            className={`min-w-0 flex-1 truncate text-sm font-medium transition-colors hover:text-lime-400 ${
                              row.status === "solved" ? "text-zinc-400 text-zinc-500" : ""
                            }`}
                          >
                            {displayTitle(q)}
                          </Link>
                          <span className="hidden text-[11px] text-zinc-400 sm:inline">
                            {q.topic}
                          </span>
                          <span className="hidden md:inline-flex">
                            <Stars
                              value={row.confidence}
                              onChange={(v) => update(q.id, { confidence: v })}
                              size="text-sm"
                            />
                          </span>
                          <DifficultyBadge tag={q.tag as Tag} />
                          <button
                            title={row.bookmark ? "Remove bookmark" : "Bookmark"}
                            onClick={() => update(q.id, { bookmark: !row.bookmark })}
                            className={`transition-all hover:scale-110 ${
                              row.bookmark
                                ? "text-amber-500"
                                : "text-zinc-300 hover:text-zinc-500"
                            }`}
                          >
                            <BookmarkIcon filled={row.bookmark} className="size-4" />
                          </button>
                          <button
                            title={row.needsRevision ? "Unmark for revision" : "Mark for revision"}
                            onClick={() => update(q.id, { needsRevision: !row.needsRevision })}
                            className={`transition-all hover:scale-110 ${
                              row.needsRevision
                                ? "text-lime-400"
                                : "text-zinc-300 hover:text-zinc-500"
                            }`}
                          >
                            <RepeatIcon className="size-4" />
                          </button>
                          {q.link && (
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noreferrer"
                              title="Open original"
                              className="text-zinc-400 transition-colors hover:text-lime-400"
                            >
                              <ExternalLinkIcon className="size-3.5" />
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {!isCollapsed && qs.length === 0 && search && (
                <p className="border-t border-zinc-100 py-6 text-center text-xs text-zinc-400 border-zinc-200 dark:border-zinc-800">
                  No matches in this sheet.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────
function ProblemsInner() {
  const params = useSearchParams();
  const [activeTab, setActiveTab] = useState<"builtin" | "imports">(
    params.get("tab") === "imports" ? "imports" : "builtin",
  );
  const { sheets, questions: importedQs, refresh: refreshImports } = useSheets();
  const [showGlobalAdd, setShowGlobalAdd] = useState(false);
  const [selectedSheetId, setSelectedSheetId] = useState<number | null>(null);
  const effectiveSheetId = selectedSheetId ?? sheets[0]?.id ?? null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
          <p className="mt-1 text-sm text-zinc-500">
            215 curated problems + your imported sheets, all in one place.
          </p>
        </div>
        <button
          onClick={() => setShowGlobalAdd(!showGlobalAdd)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            showGlobalAdd
              ? "bg-lime-400/10 text-lime-600 ring-1 ring-lime-400/40 dark:text-lime-300"
              : "bg-lime-400 text-white hover:bg-lime-600"
          }`}
        >
          {showGlobalAdd ? "✕ Cancel" : "+ Add Question"}
        </button>
      </div>

      {/* Global add panel */}
      {showGlobalAdd && (
        <div className="mb-5 rounded-2xl border border-lime-400/40 bg-white dark:bg-zinc-900/60 p-5">
          {sheets.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No sheets yet.{" "}
              <Link href="/sheets" className="text-lime-400 hover:underline">
                Create a sheet first
              </Link>
              , then add questions to it.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-zinc-700 text-zinc-300">
                  Add to:
                </label>
                <select
                  className="rounded-lg border border-zinc-300 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-lime-400 bg-white dark:bg-zinc-900"
                  value={effectiveSheetId ?? ""}
                  onChange={(e) => setSelectedSheetId(Number(e.target.value))}
                >
                  {sheets.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              {effectiveSheetId && (
                <AddQuestionPanel
                  sheetId={effectiveSheetId}
                  existingQuestions={importedQs.filter((q) => q.sheetId === effectiveSheetId)}
                  onSaved={() => {
                    refreshImports();
                    setShowGlobalAdd(false);
                    setActiveTab("imports");
                  }}
                  onClose={() => setShowGlobalAdd(false)}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-5 flex gap-1 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 p-1 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <button
          onClick={() => setActiveTab("builtin")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "builtin"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Built-in · 215
        </button>
        <button
          onClick={() => setActiveTab("imports")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            activeTab === "imports"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          My Imports
          {importedQs.length > 0 && (
            <span className="ml-1.5 rounded-full bg-lime-400/20 px-1.5 py-0.5 text-[11px] font-semibold text-lime-400">
              {importedQs.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "builtin" ? <BuiltinTab /> : <ImportsTab />}
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense>
      <ProblemsInner />
    </Suspense>
  );
}
