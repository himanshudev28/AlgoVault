import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customQuestions } from "@/db/schema";
import { questionById } from "@/data/questions";

// A question id is valid if it's in the built-in catalog (1–215) or an
// imported question owned by this user (ids ≥ 100000).
export async function isUsersQuestion(userId: string, questionId: number): Promise<boolean> {
  if (questionById.has(questionId)) return true;
  const rows = await db
    .select({ id: customQuestions.id })
    .from(customQuestions)
    .where(and(eq(customQuestions.id, questionId), eq(customQuestions.userId, userId)))
    .limit(1);
  return rows.length > 0;
}
