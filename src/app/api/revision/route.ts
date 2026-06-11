import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, progress } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { sm2 } from "@/lib/sm2";
import { isUsersQuestion } from "@/lib/questions";

// POST { questionId, quality: 1..5 } — record a revision review.
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const questionId = Number(body.questionId);
  const quality = Math.max(0, Math.min(5, Number(body.quality)));
  if (!(await isUsersQuestion(userId, questionId))) {
    return NextResponse.json({ error: "Unknown question" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.questionId, questionId)))
    .limit(1);
  const prev = existing[0];

  const state = {
    easeFactor: prev?.easeFactor ?? 2.5,
    intervalDays: prev?.intervalDays ?? 0,
    repetitions: prev?.repetitions ?? 0,
  };
  const next = sm2(state, quality);
  const now = new Date();

  const patch = {
    easeFactor: next.easeFactor,
    intervalDays: next.intervalDays,
    repetitions: next.repetitions,
    nextReviewAt: next.nextReviewAt,
    lastRevisedAt: now,
    confidence: quality,
    updatedAt: now,
  };

  const [row] = await db
    .insert(progress)
    .values({ userId, questionId, ...patch })
    .onConflictDoUpdate({
      target: [progress.userId, progress.questionId],
      set: patch,
    })
    .returning();

  await db.insert(activityLog).values({ userId, questionId, action: "revised" });

  return NextResponse.json({ row });
}
