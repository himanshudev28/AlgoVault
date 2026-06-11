"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_PROGRESS, ProgressRow } from "@/lib/types";

export type ProgressMap = Map<number, ProgressRow>;

export function getProgress(map: ProgressMap, questionId: number): ProgressRow {
  return map.get(questionId) ?? { questionId, ...EMPTY_PROGRESS };
}

export function useProgress() {
  const [map, setMap] = useState<ProgressMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetch("/api/progress")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load progress");
        return r.json();
      })
      .then((data) => {
        if (!mounted.current) return;
        const m = new Map<number, ProgressRow>();
        for (const row of data.rows) m.set(row.questionId, row);
        setMap(m);
      })
      .catch((e) => mounted.current && setError(e.message))
      .finally(() => mounted.current && setLoading(false));
    return () => {
      mounted.current = false;
    };
  }, []);

  // Optimistic update; rolls back on failure.
  const update = useCallback(
    async (questionId: number, patch: Partial<ProgressRow>) => {
      let prevRow: ProgressRow | undefined;
      setMap((prev) => {
        prevRow = prev.get(questionId);
        const next = new Map(prev);
        next.set(questionId, { ...getProgress(prev, questionId), ...patch });
        return next;
      });
      try {
        const res = await fetch("/api/progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, ...patch }),
        });
        if (!res.ok) throw new Error("save failed");
        const { row } = await res.json();
        if (mounted.current) {
          setMap((prev) => {
            const next = new Map(prev);
            next.set(questionId, row);
            return next;
          });
        }
      } catch {
        if (mounted.current) {
          setMap((prev) => {
            const next = new Map(prev);
            if (prevRow) next.set(questionId, prevRow);
            else next.delete(questionId);
            return next;
          });
        }
      }
    },
    [],
  );

  return { map, loading, error, update, getRow: (id: number) => getProgress(map, id) };
}
