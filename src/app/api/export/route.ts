import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, customQuestions, progress, sheets } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { questionById } from "@/data/questions";

// GET → downloads all of the user's data as JSON (you own your data).
export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [rows, activity, mySheets, customs] = await Promise.all([
    db.select().from(progress).where(eq(progress.userId, userId)),
    db.select().from(activityLog).where(eq(activityLog.userId, userId)),
    db.select().from(sheets).where(eq(sheets.userId, userId)),
    db.select().from(customQuestions).where(eq(customQuestions.userId, userId)),
  ]);

  const customById = new Map(customs.map((q) => [q.id, q]));
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "AlgoVault",
    progress: rows.map((r) => {
      const q = questionById.get(r.questionId) ?? customById.get(r.questionId);
      return { ...r, userId: undefined, questionTitle: q?.title ?? "(deleted)" };
    }),
    activity: activity.map((a) => ({ ...a, userId: undefined })),
    sheets: mySheets.map((s) => ({ ...s, userId: undefined })),
    customQuestions: customs.map((q) => ({ ...q, userId: undefined })),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="algovault-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
