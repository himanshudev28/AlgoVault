import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { customQuestions } from "@/db/schema";
import { requireUserId } from "@/lib/session";
import { askGroq } from "@/lib/groq";
import { questionById } from "@/data/questions";

const SYSTEM = `You are a world-class DSA (data structures & algorithms) tutor helping someone prepare for coding interviews.
Be precise, concise and correct. Use markdown. Never reproduce copyrighted problem statements — refer to the problem by name and assume the user has read it on the original platform.`;

const STAGES: Record<string, (title: string, topic: string, note: string) => string> = {
  hint: (t, topic) =>
    `For the problem "${t}" (topic: ${topic}): give ONE short hint that nudges me toward the key idea without revealing the approach. 2-3 sentences max. No code.`,
  approach: (t, topic, note) =>
    `For the problem "${t}" (topic: ${topic}${note ? `, key idea: ${note}` : ""}): explain the intuition and the optimal approach step by step. Start from the brute force and why it's slow, then build to the optimal solution. No full code yet — pseudocode of the core idea only.`,
  complexity: (t, topic) =>
    `For the problem "${t}" (topic: ${topic}): state the time and space complexity of the brute force AND the optimal approach, with a one-line justification each. Then list the top 3 edge cases / common mistakes.`,
  solution: (t, topic, note) =>
    `For the problem "${t}" (topic: ${topic}${note ? `, key idea: ${note}` : ""}): give a clean, well-commented optimal solution in C++, then the same in Python. End with the pattern this problem belongs to and 2-3 related problems to practice next.`,
  simpler: (t, topic) =>
    `Explain the optimal approach to "${t}" (topic: ${topic}) like I'm a complete beginner. Use a simple real-world analogy. Short paragraphs, no jargon, no code.`,
  hindi: (t, topic) =>
    `"${t}" (topic: ${topic}) problem ka optimal approach Hinglish (Hindi written in roman script) mein samjhao — jaise ek dost interview prep karwa raha ho. Code ke comments English mein rakho.`,
};

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const questionId = Number(body.questionId);
  const stage = String(body.stage);

  let question: { title: string; topic: string; note: string } | undefined =
    questionById.get(questionId);
  if (!question) {
    const rows = await db
      .select()
      .from(customQuestions)
      .where(and(eq(customQuestions.id, questionId), eq(customQuestions.userId, userId)))
      .limit(1);
    question = rows[0];
  }
  if (!question || !(stage in STAGES)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const prompt = STAGES[stage](question.title, question.topic, question.note);
    const text = await askGroq(SYSTEM, prompt);
    return NextResponse.json({ text });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "AI request failed — try again in a moment." },
      { status: 502 },
    );
  }
}
