import type { DraftQuestion } from "@/lib/types";

// Small CSV parser: handles quoted fields, commas inside quotes, CRLF.
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

// Convert a URL slug to a readable title ("two-sum" → "Two Sum")
function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// If a "title" field is actually a URL, derive the readable name from its slug.
// Also strips leading numeric prefixes like "1.", "01.", "Q1. " etc.
function cleanTitle(raw: string): string {
  let t = raw.trim();
  // Strip leading numbering: "1. ", "01. ", "Q1. ", etc.
  t = t.replace(/^[\d]+[.)]\s*/, "").replace(/^[Qq][\d]+[.)]\s*/, "").trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    try {
      const slug = new URL(t).pathname.split("/").filter(Boolean).pop() ?? "";
      return slug ? slugToTitle(slug) : t;
    } catch {
      return t;
    }
  }
  return t;
}

const TAG_ALIASES: Record<string, string> = {
  easy: "easy",
  "easy+": "easy+",
  medium: "medium",
  med: "medium",
  "medium+": "medium+",
  hard: "hard",
  difficult: "hard",
  basic: "easy",
};

// Expected columns: title, link, topic, difficulty/tag, note — header row
// optional, order flexible when a header exists.
export function csvToQuestions(text: string): DraftQuestion[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const findCol = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const titleCol = findCol("title", "name", "problem", "question");
  const hasHeader = titleCol !== -1;

  const cols = hasHeader
    ? {
        title: titleCol,
        link: findCol("link", "url", "source"),
        topic: findCol("topic", "category", "section"),
        tag: findCol("difficulty", "tag", "level"),
        note: findCol("note", "notes", "hint", "approach"),
      }
    : { title: 0, link: 1, topic: 2, tag: 3, note: 4 };

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const get = (row: string[], idx: number) => (idx >= 0 && row[idx] ? row[idx].trim() : "");

  return dataRows
    .map((row) => ({
      title: cleanTitle(get(row, cols.title)),
      link: get(row, cols.link),
      topic: get(row, cols.topic) || "Custom",
      tag: TAG_ALIASES[get(row, cols.tag).toLowerCase()] ?? "medium",
      note: get(row, cols.note),
    }))
    .filter((q) => q.title.length > 0);
}
