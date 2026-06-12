"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { csvToQuestions } from "@/lib/csv";
import { useSheets } from "@/lib/useSheets";
import { useProgress } from "@/lib/useProgress";
import type { DraftQuestion } from "@/lib/types";
import { Spinner } from "@/components/ui";

const TAG_OPTIONS = ["easy", "easy+", "medium", "medium+", "hard"];

const EMPTY_ROW: DraftQuestion = { title: "", link: "", topic: "Custom", tag: "medium", note: "" };

export default function SheetsPage() {
  const { sheets, questions, loading, error, refresh } = useSheets();
  const { map } = useProgress();

  const [mode, setMode] = useState<"list" | "import">("list");
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<"csv" | "pdf" | "manual">("csv");
  const [drafts, setDrafts] = useState<DraftQuestion[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");

  const startReview = (rows: DraftQuestion[], src: typeof sourceType) => {
    if (rows.length === 0) {
      setImportError("No problems found — check the format (needs a title column).");
      return;
    }
    setImportError(null);
    setSourceType(src);
    setDrafts(rows);
  };

  const handleCsvFile = async (file: File) => {
    startReview(csvToQuestions(await file.text()), "csv");
  };

  const handlePdfFile = async (file: File) => {
    setBusy("Reading PDF and extracting problems with AI…");
    setImportError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/sheets/parse", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "PDF parsing failed");
      startReview(
        data.questions.map((q: Partial<DraftQuestion>) => ({ ...EMPTY_ROW, ...q })),
        "pdf",
      );
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "PDF parsing failed");
    } finally {
      setBusy(null);
    }
  };

  const doImport = async () => {
    if (!drafts) return;
    setBusy("Importing…");
    setImportError(null);
    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "My Sheet", sourceType, questions: drafts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      await refresh();
      setMode("list");
      setDrafts(null);
      setName("");
      setCsvText("");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(null);
    }
  };

  const deleteSheet = async (id: number, sheetName: string) => {
    if (!confirm(`Delete "${sheetName}" and all its progress? This can't be undone.`)) return;
    await fetch(`/api/sheets?id=${id}`, { method: "DELETE" });
    refresh();
  };

  const input =
    "rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-lime-400";
  const card =
    "rounded-2xl border border-zinc-800 bg-zinc-900 border-zinc-800 bg-zinc-900/40";
  const btn =
    "rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-lime-600 disabled:opacity-60";
  const btnGhost =
    "rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:border-lime-300 border-zinc-800";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-sm text-zinc-500">
        <Spinner /> Loading sheets…
      </div>
    );
  }
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;

  // ─── Review step ───
  if (mode === "import" && drafts) {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold tracking-tight">Review before importing</h1>
        <p className="mt-1 mb-4 text-sm text-zinc-500">
          {drafts.length} problems detected{sourceType === "pdf" ? " by AI — double-check them" : ""}.
          Fix anything that looks off, then import.
        </p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            className={`${input} w-64`}
            placeholder="Sheet name (e.g. Striver SDE)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className={btn} onClick={doImport} disabled={busy !== null}>
            {busy ? busy : `Import ${drafts.length} problems`}
          </button>
          <button className={btnGhost} onClick={() => setDrafts(null)} disabled={busy !== null}>
            Back
          </button>
          {importError && <span className="text-xs text-red-500">{importError}</span>}
        </div>

        <div className={`${card} overflow-x-auto`}>
          <table className="w-full min-w-175 text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500 border-zinc-800">
                <th className="px-3 py-2 font-medium">Title *</th>
                <th className="px-3 py-2 font-medium">Link</th>
                <th className="px-3 py-2 font-medium">Topic</th>
                <th className="px-3 py-2 font-medium">Difficulty</th>
                <th className="px-3 py-2 font-medium">Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {drafts.map((d, i) => {
                const cell =
                  "w-full bg-transparent px-1 py-1 text-sm outline-none focus:bg-lime-400/5";
                const set = (patch: Partial<DraftQuestion>) =>
                  setDrafts((prev) =>
                    prev!.map((row, j) => (j === i ? { ...row, ...patch } : row)),
                  );
                return (
                  <tr
                    key={i}
                    className="border-b border-zinc-800 last:border-0 border-zinc-800/60"
                  >
                    <td className="px-2 py-1">
                      <input className={cell} value={d.title} onChange={(e) => set({ title: e.target.value })} />
                    </td>
                    <td className="max-w-44 px-2 py-1">
                      <input className={`${cell} text-zinc-500`} value={d.link} onChange={(e) => set({ link: e.target.value })} />
                    </td>
                    <td className="px-2 py-1">
                      <input className={`${cell} w-32`} value={d.topic} onChange={(e) => set({ topic: e.target.value })} />
                    </td>
                    <td className="px-2 py-1">
                      <select
                        className="rounded-md border border-zinc-800 bg-transparent px-1.5 py-1 text-xs border-zinc-800"
                        value={d.tag}
                        onChange={(e) => set({ tag: e.target.value })}
                      >
                        {TAG_OPTIONS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </td>
                    <td className="max-w-40 px-2 py-1">
                      <input className={`${cell} text-zinc-500`} value={d.note} onChange={(e) => set({ note: e.target.value })} />
                    </td>
                    <td className="px-2 py-1">
                      <button
                        title="Remove row"
                        onClick={() => setDrafts((prev) => prev!.filter((_, j) => j !== i))}
                        className="text-xs text-zinc-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          className={`${btnGhost} mt-3 text-xs`}
          onClick={() => setDrafts((prev) => [...prev!, { ...EMPTY_ROW }])}
        >
          + Add row
        </button>
      </div>
    );
  }

  // ─── Source step ───
  if (mode === "import") {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">Import a sheet</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-500">
          Bring any problem list — you&apos;ll review every row before it&apos;s saved.
        </p>

        {busy && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-lime-400/10 px-4 py-3 text-sm text-lime-600 dark:text-lime-300">
            <Spinner /> {busy}
          </div>
        )}
        {importError && (
          <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {importError}
          </p>
        )}

        <div className="space-y-4">
          <div className={`${card} p-5`}>
            <h2 className="font-semibold">📄 CSV / Excel export</h2>
            <p className="mt-1 mb-3 text-xs text-zinc-500">
              Columns: <code className="font-mono">title, link, topic, difficulty, note</code> —
              header row optional. Upload a file or paste below.
            </p>
            <input
              ref={csvFileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleCsvFile(e.target.files[0])}
            />
            <div className="flex flex-wrap gap-2">
              <button className={btnGhost} onClick={() => csvFileRef.current?.click()}>
                Choose CSV file
              </button>
            </div>
            <textarea
              className={`${input} mt-3 min-h-24 w-full font-mono text-xs`}
              placeholder={`Two Sum,https://leetcode.com/problems/two-sum/,Hashing,easy,Classic HashMap\nValid Parentheses,https://leetcode.com/problems/valid-parentheses/,Stack,easy,Push open pop close`}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            {csvText.trim() && (
              <button className={`${btn} mt-2`} onClick={() => startReview(csvToQuestions(csvText), "csv")}>
                Parse pasted CSV
              </button>
            )}
          </div>

          <div className={`${card} p-5`}>
            <h2 className="font-semibold">🤖 PDF (AI-extracted)</h2>
            <p className="mt-1 mb-3 text-xs text-zinc-500">
              Text-based PDFs only (no scans). AI extracts the problems; you confirm every row
              before import.
            </p>
            <input
              ref={pdfFileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePdfFile(e.target.files[0])}
            />
            <button className={btnGhost} onClick={() => pdfFileRef.current?.click()} disabled={busy !== null}>
              Choose PDF file
            </button>
          </div>

          <div className={`${card} p-5`}>
            <h2 className="font-semibold">✍️ Start from scratch</h2>
            <p className="mt-1 mb-3 text-xs text-zinc-500">Add problems by hand.</p>
            <button
              className={btnGhost}
              onClick={() => startReview([{ ...EMPTY_ROW, title: "My first problem" }], "manual")}
            >
              New empty sheet
            </button>
          </div>
        </div>

        <button className={`${btnGhost} mt-6`} onClick={() => setMode("list")}>
          ← Back to my sheets
        </button>
      </div>
    );
  }

  // ─── List view ───
  const countBySheet = new Map<number, { total: number; solved: number }>();
  for (const q of questions) {
    const c = countBySheet.get(q.sheetId) ?? { total: 0, solved: 0 };
    c.total++;
    if (map.get(q.id)?.status === "solved") c.solved++;
    countBySheet.set(q.sheetId, c);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Sheets</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Imported problem lists — tracked with the same status, notes and revision flow.
          </p>
        </div>
        <button className={btn} onClick={() => setMode("import")}>
          + Import sheet
        </button>
      </div>

      {sheets.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <div className="mb-2 text-3xl">📋</div>
          <p className="text-sm font-medium">No custom sheets yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500">
            The built-in 215-problem sheet lives under Problems. Import a CSV or PDF to track
            other lists (Striver, Love Babbar, your college sheet…) alongside it.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sheets.map((s) => {
            const c = countBySheet.get(s.id) ?? { total: 0, solved: 0 };
            const pct = c.total ? Math.round((c.solved / c.total) * 100) : 0;
            return (
              <div key={s.id} className={`${card} group p-5`}>
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/sheets/${s.id}`} className="min-w-0">
                    <h2 className="truncate font-semibold transition-colors group-hover:text-lime-400">
                      {s.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {c.total} problems · {s.sourceType.toUpperCase()} import
                    </p>
                  </Link>
                  <button
                    title="Delete sheet"
                    onClick={() => deleteSheet(s.id, s.name)}
                    className="text-xs text-zinc-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-zinc-500">
                    <span>
                      {c.solved}/{c.total} solved
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-lime-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/sheets/${s.id}`}
                  className="mt-4 inline-block text-xs font-medium text-lime-400 hover:underline"
                >
                  Open sheet →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
