import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customQuestions, progress, sheets } from "@/db/schema";
import { requireUserId } from "@/lib/session";

const VALID_TAGS = new Set(["easy", "easy+", "medium", "medium+", "hard"]);

// PATCH { id, title?, link?, topic?, tag?, note?, description? } — update one question
export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify ownership via sheet
  const existing = await db
    .select({ id: customQuestions.id })
    .from(customQuestions)
    .where(and(eq(customQuestions.id, id), eq(customQuestions.userId, userId)))
    .limit(1);
  if (!existing.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title.trim().slice(0, 300);
  if (typeof body.link === "string") patch.link = body.link.trim().slice(0, 1000);
  if (typeof body.topic === "string") patch.topic = body.topic.trim().slice(0, 100) || "Custom";
  if (typeof body.tag === "string") patch.tag = VALID_TAGS.has(body.tag) ? body.tag : "medium";
  if (typeof body.note === "string") patch.note = body.note.trim().slice(0, 500);
  if (typeof body.description === "string") patch.description = body.description.trim().slice(0, 50_000);

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(customQuestions)
    .set(patch)
    .where(eq(customQuestions.id, id))
    .returning();

  return NextResponse.json({ question: updated });
}

// DELETE ?id=<questionId> — remove one question and its progress
export async function DELETE(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await db
    .select({ id: customQuestions.id })
    .from(customQuestions)
    .where(and(eq(customQuestions.id, id), eq(customQuestions.userId, userId)))
    .limit(1);
  if (!existing.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(progress).where(and(eq(progress.userId, userId), eq(progress.questionId, id)));
  await db.delete(customQuestions).where(eq(customQuestions.id, id));

  return NextResponse.json({ ok: true });
}
