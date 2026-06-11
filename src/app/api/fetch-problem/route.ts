import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { askGroqJson } from "@/lib/groq";

const LC_GRAPHQL = "https://leetcode.com/graphql/";
const LC_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      difficulty
      content
      topicTags { name }
    }
  }
`;

const DIFF_NORM: Record<string, string> = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
};

function lcSlug(url: string): string | null {
  const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/);
  return m ? m[1] : null;
}

// Very minimal sanitizer — strips script/iframe/event handlers from HTML.
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const url = String(body.url ?? "").trim();
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  try {
    // ── LeetCode ──────────────────────────────────────────────────────────────
    const slug = lcSlug(url);
    if (slug) {
      const res = await fetch(LC_GRAPHQL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
          Origin: "https://leetcode.com",
        },
        body: JSON.stringify({ query: LC_QUERY, variables: { titleSlug: slug } }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`);
      const { data } = await res.json();
      const q = data?.question;
      if (!q?.title) throw new Error("Problem not found on LeetCode — check the URL");
      const diff = (q.difficulty as string).toLowerCase();
      return NextResponse.json({
        title: q.title as string,
        difficulty: DIFF_NORM[diff] ?? "medium",
        description: sanitizeHtml(String(q.content ?? "")),
        tags: (q.topicTags as { name: string }[]).map((t) => t.name),
        platform: "LeetCode",
        link: url,
      });
    }

    // ── GFG / other — Jina Reader + Groq extraction ───────────────────────────
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const jinaRes = await fetch(jinaUrl, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!jinaRes.ok) throw new Error(`Could not load page (HTTP ${jinaRes.status})`);
    const pageText = await jinaRes.text();

    const extracted = (await askGroqJson(
      "You are a precise JSON extractor for DSA problem pages. Return ONLY valid JSON, no markdown.",
      `Extract DSA problem info from this web page text. Return JSON with exactly these keys:
- "title": the problem title as a string
- "difficulty": one of "easy", "easy+", "medium", "medium+", "hard" (pick the closest)
- "description": the full problem statement as plain text, max 3000 chars
- "tags": array of topic strings like ["Arrays", "Dynamic Programming"]

Web page text:
${pageText.slice(0, 8000)}`,
    )) as { title?: string; difficulty?: string; description?: string; tags?: unknown };

    const title = String(extracted?.title ?? "").trim();
    if (!title) throw new Error("Could not extract problem title — try a different URL or add manually");

    const platform = url.includes("geeksforgeeks.org")
      ? "GFG"
      : url.includes("codeforces.com")
        ? "Codeforces"
        : url.includes("codechef.com")
          ? "CodeChef"
          : "Custom";

    return NextResponse.json({
      title,
      difficulty: String(extracted?.difficulty ?? "medium"),
      description: String(extracted?.description ?? ""),
      tags: Array.isArray(extracted?.tags) ? (extracted.tags as unknown[]).map(String) : [],
      platform,
      link: url,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch problem";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
