import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customQuestions, sheets } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { csvToQuestions } from "@/lib/csv";
import { BHAIYA_SHEETS } from "@/data/bhaiyaSheets";

// POST { sheetId } — fetches the Google Sheet CSV and imports it as a user sheet.
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sheetId } = await req.json();
  const catalog = BHAIYA_SHEETS.find((s) => s.id === sheetId);
  if (!catalog) return NextResponse.json({ error: "Unknown sheet" }, { status: 400 });
  if (!catalog.csvExportUrl && !catalog.questions) {
    return NextResponse.json(
      { error: "This sheet has no auto-import URL — open it manually via the external link." },
      { status: 400 },
    );
  }

  let questions: { title: string; link: string; topic: string; tag: string; note?: string }[];

  if (catalog.questions) {
    // Static built-in questions — use directly, titles are already clean
    questions = catalog.questions;
  } else {
    let csvText: string;
    try {
      const res = await fetch(catalog.csvExportUrl!, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      csvText = await res.text();
    } catch (e) {
      return NextResponse.json(
        { error: `Failed to fetch sheet: ${e instanceof Error ? e.message : "network error"}` },
        { status: 502 },
      );
    }
    questions = csvToQuestions(csvText);
  }

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No problems found — the sheet format may have changed. Try importing manually." },
      { status: 422 },
    );
  }

  const [sheet] = await db
    .insert(sheets)
    .values({ userId, name: catalog.name, sourceType: "csv" })
    .returning();

  const inserted = await db
    .insert(customQuestions)
    .values(
      questions.slice(0, 1000).map((q, i) => ({
        userId,
        sheetId: sheet.id,
        title: q.title.slice(0, 300),
        link: (q.link ?? "").slice(0, 1000),
        topic: (q.topic || "General").slice(0, 100),
        tag: q.tag || "medium",
        note: (q.note ?? "").slice(0, 500),
        description: "",
        order: i,
      })),
    )
    .returning();

  return NextResponse.json({ sheetId: sheet.id, count: inserted.length });
}
