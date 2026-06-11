export type Status = "not_started" | "attempting" | "solved";

export interface ProgressRow {
  questionId: number;
  status: Status;
  bookmark: boolean;
  needsRevision: boolean;
  confidence: number | null;
  note: string;
  solutionCode: string;
  solutionLanguage: string;
  attempts: number;
  firstSolvedAt: string | null;
  lastRevisedAt: string | null;
  nextReviewAt: string | null;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface CustomQuestion {
  id: number;
  sheetId: number;
  title: string;
  link: string;
  topic: string;
  tag: string;
  note: string;
  description: string;
  order: number;
}

export interface Sheet {
  id: number;
  name: string;
  sourceType: string;
  createdAt: string;
}

export interface DraftQuestion {
  title: string;
  link: string;
  topic: string;
  tag: string;
  note: string;
}

export const EMPTY_PROGRESS: Omit<ProgressRow, "questionId"> = {
  status: "not_started",
  bookmark: false,
  needsRevision: false,
  confidence: null,
  note: "",
  solutionCode: "",
  solutionLanguage: "cpp",
  attempts: 0,
  firstSolvedAt: null,
  lastRevisedAt: null,
  nextReviewAt: null,
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
};
