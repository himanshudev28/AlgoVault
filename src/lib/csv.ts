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

// Keywords that identify a row as a header row when found in cell text.
// Used to skip metadata rows at the top of sheets (e.g. Apna College has 10 junk rows before its real header).
const HEADER_KEYWORDS = [
  "title", "name", "problem", "question",
  "link", "url", "source",
  "topic", "category", "section",
  "difficulty", "tag", "level",
  "note", "notes", "hint", "approach", "remark",
  "compan",
];

function scoreHeaderRow(row: string[]): number {
  return row.filter((cell) => {
    const c = cell.trim().toLowerCase();
    return c.length > 0 && HEADER_KEYWORDS.some((kw) => c.includes(kw));
  }).length;
}

// Find the index of the most likely header row within the first 30 rows.
// Returns 0 (no recognizable header found) when no row scores ≥ 2.
function findHeaderRowIndex(rows: string[][]): number {
  let bestIdx = -1;
  let bestScore = 1; // must beat 1 to be considered a real header
  const limit = Math.min(rows.length, 30);
  for (let i = 0; i < limit; i++) {
    const s = scoreHeaderRow(rows[i]);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  return bestIdx; // -1 means no header found
}

// Expected columns: title, link, topic, difficulty/tag, note — header row
// optional, order flexible when a header exists.
// Handles sheets with metadata rows before the real header (e.g. Apna College).
export function csvToQuestions(text: string): DraftQuestion[] {
  const rows = parseCsvRows(text);
  if (rows.length === 0) return [];

  const headerRowIdx = findHeaderRowIndex(rows);
  const hasHeader = headerRowIdx >= 0;

  // Build column index map using substring matching (handles "Question (375)" → "question")
  const header = hasHeader ? rows[headerRowIdx].map((h) => h.trim().toLowerCase()) : [];
  const findCol = (...names: string[]): number => {
    if (!hasHeader) return -1;
    // Exact match first for precision
    const exact = header.findIndex((h) => names.includes(h));
    if (exact >= 0) return exact;
    // Substring match: header cell contains keyword
    return header.findIndex((h) => names.some((n) => h.includes(n)));
  };

  let titleCol: number;
  let linkCol: number;
  let topicCol: number;
  let tagCol: number;
  let noteCol: number;

  if (hasHeader) {
    titleCol = findCol("title", "name", "problem", "question");
    linkCol  = findCol("link", "url", "source");
    topicCol = findCol("topic", "category", "section");
    tagCol   = findCol("difficulty", "tag", "level");
    noteCol  = findCol("note", "notes", "hint", "approach", "remark", "remarks");
    // If header row found but no title column matched, fall back to first non-topic column
    if (titleCol < 0) titleCol = topicCol >= 0 && topicCol === 0 ? 1 : 0;
  } else {
    titleCol = 0; linkCol = 1; topicCol = 2; tagCol = 3; noteCol = 4;
  }

  const dataRows = hasHeader ? rows.slice(headerRowIdx + 1) : rows;
  const get = (row: string[], idx: number) => (idx >= 0 && row[idx] ? row[idx].trim() : "");

  return dataRows
    .map((row) => ({
      title: cleanTitle(get(row, titleCol)),
      link: get(row, linkCol),
      topic: get(row, topicCol) || "Custom",
      tag: TAG_ALIASES[get(row, tagCol).toLowerCase()] ?? "medium",
      note: get(row, noteCol),
    }))
    .filter((q) => q.title.length > 0);
}
