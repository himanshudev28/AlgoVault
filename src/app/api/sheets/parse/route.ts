import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { askGroqJson } from "@/lib/groq";

const SYSTEM = `You convert messy DSA problem-sheet text into structured JSON.
Return ONLY a JSON object: {"questions": [{"title": string, "link": string, "topic": string, "tag": string}]}.
- "tag" must be one of: easy, easy+, medium, medium+, hard (guess from context; default "medium").
- "link" is a URL if present in the text, else "".
- "topic" is the section/category the problem appears under, else "Custom".
- Extract every distinct problem. Never invent problems that are not in the text.`;

// POST multipart/form-data { file: <pdf> }  → { questions: [...] }
export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "PDF too large (max 10 MB)" }, { status: 400 });
  }

  try {
    // Import the inner module directly — the package root tries to read a
    // test fixture at import time when bundled.
    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buffer);
    const text = (parsed.text ?? "").trim();

    if (text.length < 30) {
      return NextResponse.json(
        { error: "Couldn't extract text — this looks like a scanned/image PDF. Try CSV instead." },
        { status: 422 },
      );
    }

    const result = (await askGroqJson(
      SYSTEM,
      `Extract the DSA problems from this sheet:\n\n${text.slice(0, 14000)}`,
    )) as { questions?: unknown[] };

    const questions = Array.isArray(result.questions) ? result.questions.slice(0, 500) : [];
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "No problems found in this PDF. Check the file or use CSV." },
        { status: 422 },
      );
    }
    return NextResponse.json({ questions });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to parse the PDF — try a text-based PDF or CSV." },
      { status: 502 },
    );
  }
}
