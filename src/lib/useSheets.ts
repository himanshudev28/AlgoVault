"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomQuestion, Sheet } from "@/lib/types";

export function useSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sheets");
      if (!res.ok) throw new Error("Failed to load sheets");
      const data = await res.json();
      setSheets(data.sheets);
      setQuestions(data.questions);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sheets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sheets, questions, loading, error, refresh };
}
