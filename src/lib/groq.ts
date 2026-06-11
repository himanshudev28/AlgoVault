import { createHash } from "crypto";
import { db } from "@/db";
import { aiCache } from "@/db/schema";
import { eq } from "drizzle-orm";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

// JSON-mode call, uncached (used for one-off imports).
export async function askGroqJson(system: string, prompt: string): Promise<unknown> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq API error ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
}

export async function askGroq(system: string, prompt: string): Promise<string> {
  const hash = createHash("sha256").update(`${MODEL}::${system}::${prompt}`).digest("hex");

  const cached = await db.select().from(aiCache).where(eq(aiCache.promptHash, hash)).limit(1);
  if (cached.length > 0) return cached[0].response;

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  if (text) {
    await db
      .insert(aiCache)
      .values({ promptHash: hash, response: text })
      .onConflictDoNothing();
  }
  return text;
}
