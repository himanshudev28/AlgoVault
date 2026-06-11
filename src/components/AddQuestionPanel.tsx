"use client";

import { useState } from "react";
import type { CustomQuestion } from "@/lib/types";
import { Spinner, DifficultyBadge } from "@/components/ui";
import type { Tag } from "@/data/questions";

const TAG_OPTIONS = ["easy", "easy+", "medium", "medium+", "hard"];

function looksLikeUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("www.");
}

function titleFromUrl(url: string): string {
  try {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    if (!slug) return "";
    return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  } catch {
    return "";
  }
}
const TOPICS = [
  "Arrays", "Strings", "Hashing", "Sorting & Searching", "Two Pointers & Sliding Window",
  "Linked List", "Stack & Queue", "Recursion & Backtracking", "Binary Search Advanced",
  "Trees", "BST", "Heaps", "Graphs", "Dynamic Programming", "Greedy", "Trie",
  "Bit Manipulation", "Math & Number Theory", "Matrix", "Custom",
];

interface FetchResult {
  title: string;
  difficulty: string;
  description: string;
  tags: string[];
  platform: string;
  link: string;
}

interface Draft {
  title: string;
  link: string;
  topic: string;
  tag: string;
  description: string;
}

interface Props {
  sheetId: number;
  existingQuestions: CustomQuestion[];
  onSaved: () => void;
  onClose: () => void;
}

function checkDuplicate(
  draft: { title: string; link: string },
  existing: CustomQuestion[],
): CustomQuestion | null {
  const lnk = draft.link.trim().toLowerCase().replace(/\/$/, "");
  const ttl = draft.title.trim().toLowerCase();
  return (
    existing.find((q) => {
      if (lnk && q.link.trim().toLowerCase().replace(/\/$/, "") === lnk) return true;
      if (ttl && q.title.trim().toLowerCase() === ttl) return true;
      return false;
    }) ?? null
  );
}

export function AddQuestionPanel({ sheetId, existingQuestions, onSaved, onClose }: Props) {
  const [tab, setTab] = useState<"url" | "manual">("url");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FetchResult | null>(null);

  const [draft, setDraft] = useState<Draft>({
    title: "", link: "", topic: "Custom", tag: "medium", description: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // If the API returned the URL itself as the title (e.g. no title found), derive from slug
  const resolvedTitle =
    preview && looksLikeUrl(preview.title)
      ? titleFromUrl(preview.link || url) || preview.title
      : preview?.title ?? "";

  const activeDraft: Draft = preview
    ? { title: resolvedTitle, link: preview.link, topic: preview.tags[0] ?? "Custom", tag: preview.difficulty, description: preview.description }
    : draft;

  const [editedDraft, setEditedDraft] = useState<Partial<Draft>>({});
  const merged: Draft = { ...activeDraft, ...editedDraft };

  const dup = checkDuplicate(merged, existingQuestions);
  const [skipDup, setSkipDup] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setFetching(true);
    setFetchError(null);
    setPreview(null);
    setEditedDraft({});
    setSkipDup(false);
    try {
      const res = await fetch("/api/fetch-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fetch failed");
      setPreview(data as FetchResult);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Fetch failed");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    const toSave = tab === "url" ? merged : draft;
    // If title is empty or looks like a URL, derive from link or fetched URL
    const rawTitle = toSave.title.trim();
    const finalTitle =
      !rawTitle || looksLikeUrl(rawTitle)
        ? titleFromUrl(toSave.link) || titleFromUrl(url) || rawTitle
        : rawTitle;
    if (!finalTitle) {
      setSaveError("Title is required");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/sheets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sheetId,
          questions: [
            {
              title: finalTitle,
              link: toSave.link.trim(),
              topic: toSave.topic || "Custom",
              tag: toSave.tag || "medium",
              description: toSave.description ?? "",
              note: "",
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      onSaved();
      onClose();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950";
  const btnPrimary =
    "rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60";
  const btnGhost =
    "rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:border-emerald-400 dark:border-zinc-700";

  return (
    <div className="rounded-2xl border border-emerald-500/40 bg-white p-5 shadow-sm dark:bg-zinc-900/60">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Add question to this sheet</h3>
        <button onClick={onClose} className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
          ✕
        </button>
      </div>

      {/* Tab switcher */}
      <div className="mb-4 flex gap-1 rounded-xl border border-zinc-200 p-1 dark:border-zinc-800">
        {(["url", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPreview(null); setFetchError(null); setEditedDraft({}); setSkipDup(false); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              tab === t
                ? "bg-emerald-500 text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t === "url" ? "Fetch from URL" : "Add manually"}
          </button>
        ))}
      </div>

      {/* URL tab */}
      {tab === "url" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className={`${input} flex-1`}
              placeholder="https://leetcode.com/problems/… or GFG URL"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setPreview(null); setFetchError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
            />
            <button className={btnPrimary} onClick={handleFetch} disabled={fetching || !url.trim()}>
              {fetching ? <Spinner className="size-4" /> : "Fetch"}
            </button>
          </div>
          {fetchError && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{fetchError}</p>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
              <div className="flex flex-wrap items-start gap-2">
                <span className="rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 text-[11px] font-medium dark:border-zinc-700 dark:bg-zinc-900">
                  {merged.tag && <DifficultyBadge tag={merged.tag as Tag} />}
                </span>
                <span className="text-[11px] text-zinc-500">{preview.platform}</span>
                {preview.tags.slice(0, 4).map((t) => (
                  <span key={t} className="rounded-md bg-zinc-200/60 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {t}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-500">Title</label>
                  <input
                    className={input}
                    value={merged.title}
                    onChange={(e) => setEditedDraft((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] font-medium text-zinc-500">Topic</label>
                    <select
                      className="w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                      value={merged.topic}
                      onChange={(e) => setEditedDraft((p) => ({ ...p, topic: e.target.value }))}
                    >
                      {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-zinc-500">Difficulty</label>
                    <select
                      className="rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                      value={merged.tag}
                      onChange={(e) => setEditedDraft((p) => ({ ...p, tag: e.target.value }))}
                    >
                      {TAG_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {preview.description && (
                <details className="rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    Problem statement preview
                  </summary>
                  <div
                    className="prose-problem max-h-52 overflow-y-auto border-t border-zinc-200 px-3 py-2 dark:border-zinc-800"
                    dangerouslySetInnerHTML={{ __html: preview.description.startsWith("<") ? preview.description : preview.description.replace(/\n/g, "<br>") }}
                  />
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual tab */}
      {tab === "manual" && (
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500">Title *</label>
            <input
              className={input}
              placeholder="e.g. Two Sum"
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-zinc-500">URL</label>
            <input
              className={input}
              placeholder="https://leetcode.com/problems/two-sum/"
              value={draft.link}
              onChange={(e) => setDraft((p) => ({ ...p, link: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium text-zinc-500">Topic</label>
              <select
                className="w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                value={draft.topic}
                onChange={(e) => setDraft((p) => ({ ...p, topic: e.target.value }))}
              >
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-zinc-500">Difficulty</label>
              <select
                className="rounded-xl border border-zinc-300 bg-white px-2.5 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                value={draft.tag}
                onChange={(e) => setDraft((p) => ({ ...p, tag: e.target.value }))}
              >
                {TAG_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate warning */}
      {dup && !skipDup && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 px-3 py-2.5">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Already in this sheet: <strong>{dup.title}</strong>
          </p>
          <button
            onClick={() => setSkipDup(true)}
            className="shrink-0 rounded-lg border border-amber-500/40 px-2.5 py-1 text-[11px] font-medium text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
          >
            Add anyway
          </button>
        </div>
      )}

      {saveError && (
        <p className="mt-2 text-xs text-red-500">{saveError}</p>
      )}

      {/* Footer actions */}
      {(preview || tab === "manual") && (!dup || skipDup) && (
        <div className="mt-4 flex gap-2">
          <button
            className={btnPrimary}
            onClick={handleSave}
            disabled={saving || (tab === "url" ? !merged.title : !draft.title)}
          >
            {saving ? <Spinner className="size-4" /> : "Save to sheet"}
          </button>
          <button className={btnGhost} onClick={onClose}>Cancel</button>
        </div>
      )}
    </div>
  );
}
