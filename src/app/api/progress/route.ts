import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, progress } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { isUsersQuestion } from "@/lib/questions";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(progress).where(eq(progress.userId, userId));
  return NextResponse.json({ rows });
}

const EDITABLE = [
  "status",
  "bookmark",
  "needsRevision",
  "confidence",
  "note",
  "solutionCode",
  "solutionLanguage",
  "attempts",
] as const;

export async function PATCH(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const questionId = Number(body.questionId);
  if (!(await isUsersQuestion(userId, questionId))) {
    return NextResponse.json({ error: "Unknown question" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) patch[key] = body[key];
  }

  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.questionId, questionId)))
    .limit(1);
  const prev = existing[0];

  const now = new Date();
  const becameSolved = patch.status === "solved" && prev?.status !== "solved";
  const becameAttempting = patch.status === "attempting" && (!prev || prev.status === "not_started");

  if (becameSolved) {
    if (!prev?.firstSolvedAt) patch.firstSolvedAt = now;
    // Seed spaced repetition: first review tomorrow (sooner if low confidence).
    if (!prev?.nextReviewAt) {
      patch.nextReviewAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
  patch.updatedAt = now;

  const [row] = await db
    .insert(progress)
    .values({ userId, questionId, ...patch })
    .onConflictDoUpdate({
      target: [progress.userId, progress.questionId],
      set: patch,
    })
    .returning();

  if (becameSolved) {
    await db.insert(activityLog).values({ userId, questionId, action: "solved" });
  } else if (becameAttempting) {
    await db.insert(activityLog).values({ userId, questionId, action: "attempted" });
  }

  return NextResponse.json({ row });
}
