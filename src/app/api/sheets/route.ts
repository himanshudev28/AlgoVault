import { NextRequest, NextResponse } from "next/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { customQuestions, progress, sheets } from "@/db/schema";
import { requireUserId } from "@/lib/session";

const VALID_TAGS = new Set(["easy", "easy+", "medium", "medium+", "hard"]);

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [mySheets, questions] = await Promise.all([
    db.select().from(sheets).where(eq(sheets.userId, userId)).orderBy(asc(sheets.createdAt)),
    db
      .select()
      .from(customQuestions)
      .where(eq(customQuestions.userId, userId))
      .orderBy(asc(customQuestions.order)),
  ]);

  return NextResponse.json({ sheets: mySheets, questions });
}

// POST { name, sourceType, questions: [{ title, link?, topic?, tag?, note? }] }
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const sourceType = ["csv", "pdf", "manual"].includes(body.sourceType)
    ? body.sourceType
    : "manual";
  const rows = Array.isArray(body.questions) ? body.questions : [];

  if (!name) return NextResponse.json({ error: "Sheet name is required" }, { status: 400 });
  if (rows.length === 0 || rows.length > 1000) {
    return NextResponse.json({ error: "Provide between 1 and 1000 questions" }, { status: 400 });
  }

  const cleaned = rows
    .map((r: Record<string, unknown>, i: number) => ({
      userId,
      title: String(r.title ?? "").trim().slice(0, 300),
      link: String(r.link ?? "").trim().slice(0, 1000),
      topic: (String(r.topic ?? "").trim() || "Custom").slice(0, 100),
      tag: VALID_TAGS.has(String(r.tag)) ? String(r.tag) : "medium",
      note: String(r.note ?? "").trim().slice(0, 500),
      order: i,
    }))
    .filter((r: { title: string }) => r.title.length > 0);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "No valid rows (every row needs a title)" }, { status: 400 });
  }

  const [sheet] = await db.insert(sheets).values({ userId, name, sourceType }).returning();
  const inserted = await db
    .insert(customQuestions)
    .values(cleaned.map((r: object) => ({ ...r, sheetId: sheet.id })))
    .returning();

  return NextResponse.json({ sheet: { ...sheet, count: inserted.length } });
}

// PATCH { action:"rename", id, name } — rename a sheet.
// PATCH { id, questions:[...] } — add more questions to an existing sheet.
export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = Number(body.id);
  const rows = Array.isArray(body.questions) ? body.questions : [];

  if (!id) return NextResponse.json({ error: "Sheet id required" }, { status: 400 });

  // Rename action
  if (body.action === "rename") {
    const name = String(body.name ?? "").trim().slice(0, 200);
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const owned = await db
      .select({ id: sheets.id })
      .from(sheets)
      .where(and(eq(sheets.id, id), eq(sheets.userId, userId)))
      .limit(1);
    if (!owned.length) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    const [updated] = await db.update(sheets).set({ name }).where(eq(sheets.id, id)).returning();
    return NextResponse.json({ sheet: updated });
  }

  if (rows.length === 0) return NextResponse.json({ error: "No questions provided" }, { status: 400 });

  const owned = await db
    .select({ id: sheets.id })
    .from(sheets)
    .where(and(eq(sheets.id, id), eq(sheets.userId, userId)))
    .limit(1);
  if (!owned.length) return NextResponse.json({ error: "Sheet not found" }, { status: 404 });

  const last = await db
    .select({ order: customQuestions.order })
    .from(customQuestions)
    .where(eq(customQuestions.sheetId, id))
    .orderBy(desc(customQuestions.order))
    .limit(1);
  const startOrder = last.length > 0 ? last[0].order + 1 : 0;

  const cleaned = rows
    .map((r: Record<string, unknown>, i: number) => ({
      userId,
      sheetId: id,
      title: String(r.title ?? "").trim().slice(0, 300),
      link: String(r.link ?? "").trim().slice(0, 1000),
      topic: (String(r.topic ?? "").trim() || "Custom").slice(0, 100),
      tag: VALID_TAGS.has(String(r.tag)) ? String(r.tag) : "medium",
      note: String(r.note ?? "").trim().slice(0, 500),
      description: String(r.description ?? "").trim().slice(0, 50_000),
      order: startOrder + i,
    }))
    .filter((r: { title: string }) => r.title.length > 0);

  if (!cleaned.length) return NextResponse.json({ error: "No valid questions" }, { status: 400 });

  const inserted = await db.insert(customQuestions).values(cleaned).returning();
  return NextResponse.json({ added: inserted.length, questions: inserted });
}

// DELETE ?id=<sheetId> — removes the sheet, its questions, and their progress.
export async function DELETE(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  const owned = await db
    .select({ id: sheets.id })
    .from(sheets)
    .where(and(eq(sheets.id, id), eq(sheets.userId, userId)))
    .limit(1);
  if (owned.length === 0) {
    return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
  }

  const qids = (
    await db
      .select({ id: customQuestions.id })
      .from(customQuestions)
      .where(eq(customQuestions.sheetId, id))
  ).map((q) => q.id);

  if (qids.length > 0) {
    await db
      .delete(progress)
      .where(and(eq(progress.userId, userId), inArray(progress.questionId, qids)));
  }
  await db.delete(sheets).where(eq(sheets.id, id)); // cascades to custom_questions

  return NextResponse.json({ ok: true });
}
