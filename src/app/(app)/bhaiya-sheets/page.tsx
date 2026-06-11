"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BHAIYA_SHEETS } from "@/data/bhaiyaSheets";
import type { Sheet } from "@/lib/types";
import { Spinner } from "@/components/ui";

const ExternalLinkIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

export default function BhaiyaSheetsPage() {
  const router = useRouter();
  const [mySheets, setMySheets] = useState<Sheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/sheets")
      .then((r) => r.json())
      .then((d) => setMySheets(d.sheets ?? []))
      .catch(() => {})
      .finally(() => setSheetsLoading(false));
  }, []);

  const importedMap = new Map<string, number>(
    mySheets
      .filter((s) => BHAIYA_SHEETS.some((b) => b.name === s.name))
      .map((s) => {
        const b = BHAIYA_SHEETS.find((b) => b.name === s.name)!;
        return [b.id, s.id] as [string, number];
      }),
  );

  const handleImport = async (sheetId: string) => {
    setImporting(sheetId);
    setErrors((prev) => ({ ...prev, [sheetId]: "" }));
    try {
      const res = await fetch("/api/bhaiya-sheets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      router.push(`/sheets/${data.sheetId}`);
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [sheetId]: e instanceof Error ? e.message : "Import failed",
      }));
    } finally {
      setImporting(null);
    }
  };

  const card = "rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40";
  const btn = "inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-60";
  const btnGhost = "inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:border-emerald-400 dark:border-zinc-700";
  const btnOutline = "inline-flex items-center gap-1.5 rounded-xl border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Bhaiya Sheets</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Popular DSA sheets curated by top educators — import any sheet to track your progress
          with all AlgoVault features.
        </p>
      </div>

      {/* Sheet grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {BHAIYA_SHEETS.map((sheet) => {
          const importedSheetId = importedMap.get(sheet.id);
          const isImported = importedSheetId !== undefined;
          const isImporting = importing === sheet.id;
          const err = errors[sheet.id];
          const canAutoImport = !!sheet.csvExportUrl || !!sheet.questions;

          return (
            <div key={sheet.id} className={`${card} flex flex-col p-5`}>
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold leading-snug">{sheet.name}</h2>
                  <p className="mt-0.5 text-xs text-zinc-500">{sheet.author}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {sheet.questionCount}+ Qs
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {sheet.description}
              </p>

              {/* Topics */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sheet.topics.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
                  >
                    {t}
                  </span>
                ))}
                {sheet.topics.length > 6 && (
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500 dark:bg-zinc-800">
                    +{sheet.topics.length - 6} more
                  </span>
                )}
              </div>

              {/* Status & Actions */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {sheetsLoading ? (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Spinner /> Checking…
                  </div>
                ) : isImported ? (
                  <>
                    <Link href={`/sheets/${importedSheetId}`} className={btnOutline}>
                      Open in Tracker →
                    </Link>
                    <a
                      href={sheet.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${btnGhost} text-xs`}
                    >
                      View original <ExternalLinkIcon />
                    </a>
                  </>
                ) : canAutoImport ? (
                  <>
                    <button
                      className={btn}
                      onClick={() => handleImport(sheet.id)}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <Spinner /> Importing…
                        </>
                      ) : (
                        "Import to Tracker"
                      )}
                    </button>
                    <a
                      href={sheet.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${btnGhost} text-xs`}
                    >
                      View sheet <ExternalLinkIcon />
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href={sheet.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={btn}
                    >
                      Open sheet <ExternalLinkIcon />
                    </a>
                    <Link href="/sheets" className={`${btnGhost} text-xs`}>
                      Import manually →
                    </Link>
                  </>
                )}
              </div>

              {/* Import note for non-auto sheets */}
              {!canAutoImport && !isImported && (
                <p className="mt-2 text-[11px] text-zinc-400">
                  Download from the link above, then use{" "}
                  <Link href="/sheets" className="text-emerald-500 hover:underline">
                    My Sheets → Import
                  </Link>{" "}
                  to add to tracker.
                </p>
              )}

              {/* Error */}
              {err && (
                <p className="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">
                  {err}
                </p>
              )}

              {/* Already-imported badge */}
              {isImported && (
                <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
                  Already in your tracker
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-zinc-400">
        Sheets are fetched directly from their public sources. You own your progress data — it never leaves your account.
      </p>
    </div>
  );
}
