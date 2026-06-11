"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui";

interface RunResult {
  compile: { stdout: string; stderr: string; code: number } | null;
  run: { stdout: string; stderr: string; code: number | null; signal: string | null };
}

export function RunPanel({ code, language }: { code: string; language: string }) {
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, stdin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Run failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  };

  const compileFailed = result?.compile && result.compile.code !== 0;
  const output = compileFailed
    ? result!.compile!.stderr || result!.compile!.stdout
    : [result?.run.stdout, result?.run.stderr].filter(Boolean).join("\n");

  return (
    <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800/60">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-medium text-emerald-500 hover:underline"
      >
        {open ? "▾ Hide runner" : "▸ Run this code (C++/Java/Python/JS, free sandbox)"}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              stdin (optional)
            </label>
            <textarea
              className="min-h-16 w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder={"5\n1 2 3 4 5"}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              spellCheck={false}
            />
          </div>
          <button
            onClick={run}
            disabled={running || !code.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            {running && <Spinner className="size-3" />}
            {running ? "Running…" : "▶ Run code"}
          </button>
          {!code.trim() && (
            <span className="ml-2 text-[11px] text-zinc-400">paste your solution above first</span>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {result && (
            <div>
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Output
                {compileFailed ? (
                  <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-red-500 normal-case">
                    compile error
                  </span>
                ) : result.run.code === 0 ? (
                  <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-500 normal-case">
                    exit 0
                  </span>
                ) : (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-500 normal-case">
                    exit {result.run.code ?? result.run.signal}
                  </span>
                )}
              </div>
              <pre className="max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-zinc-950 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-200 dark:border-zinc-800">
                {output || "(no output)"}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
