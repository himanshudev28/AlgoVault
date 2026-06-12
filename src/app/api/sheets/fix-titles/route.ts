import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { customQuestions } from "@/db/schema";
import { requireUserId } from "@/lib/session";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function titleFromUrl(url: string): string {
  try {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    return slug ? slugToTitle(slug) : "";
  } catch {
    return "";
  }
}

function looksLikeUrl(s: string): boolean {
  return s.startsWith("http://") || s.startsWith("https://");
}

// POST { sheetId } — bulk-fix all questions in a sheet where title is stored as a URL.
// Derives readable title from the URL slug (link field first, title field as fallback).
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const sheetId = body.sheetId != null ? Number(body.sheetId) : null;

  if (!sheetId || isNaN(sheetId)) {
    return NextResponse.json({ error: "sheetId required" }, { status: 400 });
  }

  // Fetch all questions for this sheet belonging to this user
  const qs = await db
    .select()
    .from(customQuestions)
    .where(and(eq(customQuestions.sheetId, sheetId), eq(customQuestions.userId, userId)));

  // Filter to only those with URL-like titles
  const toFix = qs.filter((q) => looksLikeUrl(q.title.trim()));

  if (toFix.length === 0) {
    return NextResponse.json({ fixed: 0 });
  }

  // Update each one — derive title from link URL first, then title URL as fallback
  let fixed = 0;
  for (const q of toFix) {
    const title =
      (q.link && titleFromUrl(q.link)) ||
      titleFromUrl(q.title) ||
      q.title; // keep raw URL if we can't derive anything better

    if (title !== q.title) {
      await db
        .update(customQuestions)
        .set({ title: title.slice(0, 300) })
        .where(and(eq(customQuestions.id, q.id), eq(customQuestions.userId, userId)));
      fixed++;
    }
  }

  return NextResponse.json({ fixed, total: toFix.length });
}
