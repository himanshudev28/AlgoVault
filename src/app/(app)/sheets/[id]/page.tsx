"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSheets } from "@/lib/useSheets";
import { useProgress } from "@/lib/useProgress";
import type { Tag } from "@/data/questions";
import type { CustomQuestion } from "@/lib/types";
import { DifficultyBadge, Spinner, BookmarkIcon, RepeatIcon, ExternalLinkIcon } from "@/components/ui";
import { Stars } from "@/components/Stars";
import { StatusButton } from "@/components/StatusButton";
import { AddQuestionPanel } from "@/components/AddQuestionPanel";
import { BHAIYA_SHEETS } from "@/data/bhaiyaSheets";

const TOPICS = [
  "Arrays", "Strings", "Hashing", "Sorting & Searching", "Two Pointers & Sliding Window",
  "Linked List", "Stack & Queue", "Recursion & Backtracking", "Binary Search Advanced",
  "Trees", "BST", "Heaps", "Graphs", "Dynamic Programming", "Greedy", "Trie",
  "Bit Manipulation", "Math & Number Theory", "Matrix", "Custom",
];
const TAG_OPTIONS = ["easy", "easy+", "medium", "medium+", "hard"];

const PencilIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const CheckIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

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

function displayTitle(q: CustomQuestion): string {
  const t = q.title.trim();
  if (!t || looksLikeUrl(t)) return q.link ? titleFromUrl(q.link) : "Untitled";
  return t;
}

export default function SheetDetailPage() {
  const params = useParams<{ id: string }>();
  const sheetId = Number(params.id);
  const { sheets, questions, loading, refresh } = useSheets();
  const { map, loading: progressLoading, update, getRow } = useProgress();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // Sheet rename
  const [renamingSheet, setRenamingSheet] = useState(false);
  const [sheetName, setSheetName] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  // Inline question edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", link: "", topic: "Custom", tag: "medium" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Bulk title fix
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<{ fixed: number } | null>(null);

  // Reimport from source CSV
  const [reimporting, setReimporting] = useState(false);
  const [reimportResult, setReimportResult] = useState<{ count: number; previous: number } | null>(null);
  const [reimportError, setReimportError] = useState<string | null>(null);

  const sheet = sheets.find((s) => s.id === sheetId);
  const sheetQs = useMemo(
    () => questions.filter((q) => q.sheetId === sheetId),
    [questions, sheetId],
  );
  const mine = useMemo(
    () =>
      sheetQs.filter(
        (q) => !search || displayTitle(q).toLowerCase().includes(search.toLowerCase()),
      ),
    [sheetQs, search],
  );

  const solved = useMemo(
    () => mine.filter((q) => getRow(q.id).status === "solved").length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mine, map],
  );

  const urlTitleCount = useMemo(
    () => sheetQs.filter((q) => looksLikeUrl(q.title.trim())).length,
    [sheetQs],
  );

  // Map question id → 1-based position in the full (unsorted) sheet
  const positionMap = useMemo(() => {
    const sorted = [...sheetQs].sort((a, b) => a.order - b.order);
    const m = new Map<number, number>();
    sorted.forEach((q, i) => m.set(q.id, i + 1));
    return m;
  }, [sheetQs]);

  // Whether this sheet can be reimported (has a matching catalog entry with CSV URL)
  const catalogEntry = useMemo(
    () => sheet ? BHAIYA_SHEETS.find((b) => b.name === sheet.name && !!b.csvExportUrl) : undefined,
    [sheet],
  );

  useEffect(() => {
    if (sheet && !renamingSheet) setSheetName(sheet.name);
  }, [sheet, renamingSheet]);

  useEffect(() => {
    if (renamingSheet && renameRef.current) renameRef.current.focus();
  }, [renamingSheet]);

  const saveRename = async () => {
    const name = sheetName.trim();
    if (!name || !sheet) return;
    try {
      const res = await fetch("/api/sheets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", id: sheetId, name }),
      });
      if (!res.ok) throw new Error();
      refresh();
      setRenamingSheet(false);
    } catch {
      // keep rename open on error
    }
  };

  const startEdit = (q: CustomQuestion) => {
    setEditingId(q.id);
    setEditForm({ title: displayTitle(q), link: q.link, topic: q.topic, tag: q.tag });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await fetch("/api/sheets/question", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      refresh();
      setEditingId(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Remove this question from the sheet?")) return;
    const res = await fetch(`/api/sheets/question?id=${id}`, { method: "DELETE" });
    if (res.ok) refresh();
  };

  const fixTitles = async () => {
    setFixing(true);
    setFixResult(null);
    try {
      const res = await fetch("/api/sheets/fix-titles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fix failed");
      setFixResult({ fixed: data.fixed });
      refresh();
    } catch {
      // ignore — button will stay visible to retry
    } finally {
      setFixing(false);
    }
  };

  const doReimport = async () => {
    if (!confirm("This will re-fetch the sheet CSV and replace all question data. Your solve/bookmark progress is preserved where possible. Continue?")) return;
    setReimporting(true);
    setReimportResult(null);
    setReimportError(null);
    try {
      const res = await fetch("/api/sheets/reimport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reimport failed");
      setReimportResult({ count: data.count, previous: data.previous });
      refresh();
    } catch (e) {
      setReimportError(e instanceof Error ? e.message : "Reimport failed");
    } finally {
      setReimporting(false);
    }
  };

  if (loading || progressLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading sheet…
      </div>
    );
  }
  if (!sheet) {
    return (
      <div className="p-8 text-sm text-zinc-500">
        Sheet not found.{" "}
        <Link href="/sheets" className="text-lime-400 hover:underline">
          Back to sheets
        </Link>
      </div>
    );
  }

  const pct = mine.length ? Math.round((solved / mine.length) * 100) : 0;

  const inputCls =
    "rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-lime-400";

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/sheets"
        className="mb-4 inline-block text-xs font-medium text-zinc-500 transition-colors hover:text-lime-400"
      >
        ← My sheets
      </Link>

      {/* Sheet header */}
      <div className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {renamingSheet ? (
              <div className="flex items-center gap-2">
                <input
                  ref={renameRef}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-xl font-bold outline-none transition-colors focus:border-lime-400"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename();
                    if (e.key === "Escape") setRenamingSheet(false);
                  }}
                />
                <button
                  onClick={saveRename}
                  className="inline-flex size-8 items-center justify-center rounded-lg bg-lime-400 text-white hover:bg-lime-600"
                  title="Save name"
                >
                  <CheckIcon className="size-4" />
                </button>
                <button
                  onClick={() => setRenamingSheet(false)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Cancel"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRenamingSheet(true)}
                className="group flex items-center gap-2"
                title="Click to rename"
              >
                <h1 className="text-2xl font-bold tracking-tight">{sheet.name}</h1>
                <PencilIcon className="size-4 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )}
            <p className="mt-0.5 text-xs text-zinc-500">
              {sheetQs.length} problems · {sheet.sourceType.toUpperCase()} import
            </p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              showAdd
                ? "bg-lime-400/10 text-lime-600 ring-1 ring-lime-400/40 dark:text-lime-300"
                : "bg-lime-400 text-white hover:bg-lime-600"
            }`}
          >
            {showAdd ? "✕ Cancel" : "+ Add Question"}
          </button>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex justify-between text-xs text-zinc-500">
            <span className="font-medium">
              {solved} / {mine.length} solved
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200 bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-linear-to-r from-lime-400 to-lime-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Fix names banner — shown when imported data has URLs stored as titles */}
      {urlTitleCount > 0 && !fixResult && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700/50 dark:bg-amber-950/30">
          <div className="flex min-w-0 items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>
              <strong>{urlTitleCount} question{urlTitleCount === 1 ? "" : "s"}</strong> have URLs stored as names. Auto-fix derives the readable title from the problem URL.
            </span>
          </div>
          <button
            onClick={fixTitles}
            disabled={fixing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {fixing ? <><Spinner className="size-3" /> Fixing…</> : "Auto-fix names"}
          </button>
        </div>
      )}
      {fixResult && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-lime-200 bg-emerald-50 px-4 py-3 text-sm text-lime-700 dark:border-lime-700/40 dark:bg-emerald-950/30 dark:text-lime-300">
          <CheckIcon className="size-4 shrink-0" />
          Fixed {fixResult.fixed} question name{fixResult.fixed === 1 ? "" : "s"} — titles now show correctly in the database.
          <button onClick={() => setFixResult(null)} className="ml-auto text-lime-400 hover:text-lime-700">
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      {/* Reimport banner — shown for built-in sheets with a CSV source */}
      {catalogEntry && !reimportResult && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/50 dark:bg-blue-950/30">
          <div className="flex min-w-0 items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
            <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            <span>
              Question data may have incorrect names due to a CSV column mismatch.
              <strong className="ml-1">Reimport</strong> to fix all names from the original source.
            </span>
          </div>
          <button
            onClick={doReimport}
            disabled={reimporting}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
          >
            {reimporting ? <><Spinner className="size-3" /> Reimporting…</> : "Reimport now"}
          </button>
        </div>
      )}
      {reimportResult && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-lime-200 bg-emerald-50 px-4 py-3 text-sm text-lime-700 dark:border-lime-700/40 dark:bg-emerald-950/30 dark:text-lime-300">
          <CheckIcon className="size-4 shrink-0" />
          Reimported {reimportResult.count} questions — all names are now correct.
          <button onClick={() => setReimportResult(null)} className="ml-auto text-lime-400 hover:text-lime-700">
            <XIcon className="size-4" />
          </button>
        </div>
      )}
      {reimportError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/40 dark:bg-red-950/30">
          {reimportError}
          <button onClick={() => setReimportError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      {/* Add question panel */}
      {showAdd && (
        <div className="mb-4 animate-fade-up">
          <AddQuestionPanel
            sheetId={sheetId}
            existingQuestions={sheetQs}
            onSaved={() => { refresh(); setShowAdd(false); }}
            onClose={() => setShowAdd(false)}
          />
        </div>
      )}

      {/* Search */}
      <input
        className="mb-4 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs outline-none transition-colors placeholder:text-zinc-400 focus:border-lime-400 bg-white dark:bg-zinc-900"
        placeholder="Search this sheet…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Question list */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
          {mine.map((q) => {
            const row = getRow(q.id);
            const isEditing = editingId === q.id;
            return (
              <li key={q.id}>
                {isEditing ? (
                  /* Inline edit form */
                  <div className="space-y-2 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <input
                        className={`${inputCls} min-w-0 flex-1`}
                        placeholder="Title"
                        value={editForm.title}
                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                        autoFocus
                      />
                      <input
                        className={`${inputCls} min-w-0 flex-1`}
                        placeholder="URL (optional)"
                        value={editForm.link}
                        onChange={(e) => setEditForm((p) => ({ ...p, link: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        className={`${inputCls} flex-1`}
                        value={editForm.topic}
                        onChange={(e) => setEditForm((p) => ({ ...p, topic: e.target.value }))}
                      >
                        {TOPICS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                      <select
                        className={inputCls}
                        value={editForm.tag}
                        onChange={(e) => setEditForm((p) => ({ ...p, tag: e.target.value }))}
                      >
                        {TAG_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    {editError && <p className="text-xs text-red-500">{editError}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={editSaving || !editForm.title.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-lime-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600 disabled:opacity-50"
                      >
                        {editSaving ? <Spinner className="size-3" /> : <CheckIcon className="size-3" />}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal row */
                  <div className="group flex items-center gap-2.5 px-4 py-2.5">
                    <StatusButton status={row.status} onChange={(s) => update(q.id, { status: s })} />
                    <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-zinc-400">
                      {positionMap.get(q.id)}
                    </span>
                    <Link
                      href={`/problems/${q.id}`}
                      className={`min-w-0 flex-1 truncate text-sm font-medium transition-colors hover:text-lime-400 ${
                        row.status === "solved" ? "text-zinc-400" : ""
                      }`}
                    >
                      {displayTitle(q)}
                    </Link>
                    <span className="hidden text-[11px] text-zinc-500 sm:inline">{q.topic}</span>
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
                    <button
                      onClick={() => startEdit(q)}
                      title="Edit question"
                      className="text-zinc-300 transition-colors hover:text-zinc-600"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      title="Remove question"
                      className="text-zinc-300 transition-colors hover:text-red-500"
                    >
                      <TrashIcon className="size-3.5" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {mine.length === 0 && (
          <p className="py-12 text-center text-sm text-zinc-500">
            {search ? "No problems match." : "No problems yet — add one above."}
          </p>
        )}
      </div>
    </div>
  );
}
