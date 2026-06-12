import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { customQuestions, sheets } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { csvToQuestions } from "@/lib/csv";
import { BHAIYA_SHEETS } from "@/data/bhaiyaSheets";

// POST { sheetId } — re-fetches the source CSV and replaces all questions in the sheet.
// Preserves the sheet ID and row question IDs where possible (by order) so that
// progress records for solved questions survive. Any extra old rows are deleted.
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { sheetId } = await req.json().catch(() => ({}));
  if (!sheetId) return NextResponse.json({ error: "sheetId required" }, { status: 400 });

  // Verify ownership
  const [sheet] = await db
    .select()
    .from(sheets)
    .where(and(eq(sheets.id, sheetId), eq(sheets.userId, userId)))
    .limit(1);
  if (!sheet) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });

  // Find the catalog entry to get the CSV URL
  const catalog = BHAIYA_SHEETS.find((b) => b.name === sheet.name);
  if (!catalog?.csvExportUrl) {
    return NextResponse.json(
      { error: "No source CSV URL found for this sheet. Only built-in bhaiya sheets can be reimported." },
      { status: 400 },
    );
  }

  // Fetch fresh CSV
  let csvText: string;
  try {
    const res = await fetch(catalog.csvExportUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    csvText = await res.text();
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to fetch CSV: ${e instanceof Error ? e.message : "network error"}` },
      { status: 502 },
    );
  }

  const newQuestions = csvToQuestions(csvText);
  if (newQuestions.length === 0) {
    return NextResponse.json({ error: "No questions parsed from CSV" }, { status: 422 });
  }

  // Get existing questions ordered by their `order` field
  const existing = await db
    .select()
    .from(customQuestions)
    .where(and(eq(customQuestions.sheetId, sheetId), eq(customQuestions.userId, userId)));

  existing.sort((a, b) => a.order - b.order);

  // Update rows that exist in both old and new (by order index) — preserves question IDs
  const updateCount = Math.min(existing.length, newQuestions.length);
  for (let i = 0; i < updateCount; i++) {
    const q = newQuestions[i];
    await db
      .update(customQuestions)
      .set({
        title: q.title.slice(0, 300),
        link: (q.link ?? "").slice(0, 1000),
        topic: (q.topic || "Custom").slice(0, 100),
        tag: q.tag || "medium",
        note: (q.note ?? "").slice(0, 500),
        order: i,
      })
      .where(eq(customQuestions.id, existing[i].id));
  }

  // Delete extra old rows if new CSV has fewer questions
  if (existing.length > newQuestions.length) {
    const toDelete = existing.slice(newQuestions.length).map((q) => q.id);
    for (const id of toDelete) {
      await db.delete(customQuestions).where(eq(customQuestions.id, id));
    }
  }

  // Insert extra new rows if new CSV has more questions than existing
  if (newQuestions.length > existing.length) {
    const extras = newQuestions.slice(existing.length);
    await db.insert(customQuestions).values(
      extras.map((q, i) => ({
        userId,
        sheetId,
        title: q.title.slice(0, 300),
        link: (q.link ?? "").slice(0, 1000),
        topic: (q.topic || "Custom").slice(0, 100),
        tag: q.tag || "medium",
        note: (q.note ?? "").slice(0, 500),
        description: "",
        order: existing.length + i,
      })),
    );
  }

  return NextResponse.json({ count: newQuestions.length, previous: existing.length });
}
