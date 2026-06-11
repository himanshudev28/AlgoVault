import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Users live in Clerk; `userId` columns hold Clerk user ids.

export const progress = pgTable(
  "progress",
  {
    userId: text("user_id").notNull(),
    questionId: integer("question_id").notNull(),
    status: text("status").notNull().default("not_started"), // not_started | attempting | solved
    bookmark: boolean("bookmark").notNull().default(false),
    needsRevision: boolean("needs_revision").notNull().default(false),
    confidence: integer("confidence"), // 1–5
    note: text("note").notNull().default(""),
    solutionCode: text("solution_code").notNull().default(""),
    solutionLanguage: text("solution_language").notNull().default("cpp"),
    attempts: integer("attempts").notNull().default(0),
    firstSolvedAt: timestamp("first_solved_at"),
    lastRevisedAt: timestamp("last_revised_at"),
    // SM-2 spaced repetition
    nextReviewAt: timestamp("next_review_at"),
    easeFactor: real("ease_factor").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.questionId] })],
);

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  action: text("action").notNull(), // attempted | solved | revised
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiCache = pgTable("ai_cache", {
  promptHash: text("prompt_hash").primaryKey(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sheets = pgTable("sheets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull().default("csv"), // csv | pdf | manual
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Imported questions. Ids start at 100000 so they never collide with the
// built-in catalog (ids 1–215); `progress.questionId` works for both.
export const customQuestions = pgTable("custom_questions", {
  id: integer("id").generatedAlwaysAsIdentity({ startWith: 100000 }).primaryKey(),
  sheetId: integer("sheet_id")
    .notNull()
    .references(() => sheets.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  link: text("link").notNull().default(""),
  topic: text("topic").notNull().default("Custom"),
  tag: text("tag").notNull().default("medium"),
  note: text("note").notNull().default(""),
  // Fetched problem statement (HTML for LeetCode, plain text for others).
  description: text("description").notNull().default(""),
  order: integer("order").notNull().default(0),
});
