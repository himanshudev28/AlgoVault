import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { QUESTIONS, TOPICS } from "@/data/questions";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: "🧩",
    title: `${QUESTIONS.length} curated problems`,
    desc: `A progressive sheet across ${TOPICS.length} topics — easy → easy+ → medium → medium+ → hard. Every problem links to LeetCode or GFG.`,
  },
  {
    icon: "📝",
    title: "Your notes & solutions",
    desc: "Store your own notes and accepted solution per problem. Re-reading your own thinking weeks later is the real revision superpower.",
  },
  {
    icon: "🔁",
    title: "Spaced repetition",
    desc: "Anki-style SM-2 scheduling tells you exactly what to revise today — before you forget it, not after.",
  },
  {
    icon: "🤖",
    title: "AI explanations",
    desc: "Progressive hints — hint → approach → complexity → full solution — so the answer never spoils the learning. Plus 'explain simpler' and Hinglish modes.",
  },
  {
    icon: "📊",
    title: "Actionable dashboard",
    desc: "Streaks, contribution heatmap, per-topic strength, difficulty split, and revision debt — every number is clickable into a filtered list.",
  },
  {
    icon: "⭐",
    title: "Confidence tracking",
    desc: "Rate every solve 1–5. Low-confidence problems bubble up first in your revision queue and weak-area insights.",
  },
];

export default async function Home() {
  const { isAuthenticated } = await auth();
  const session = isAuthenticated;
  const cta = session ? "/dashboard" : "/sign-up";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-bold tracking-tight">
            Algo<span className="text-emerald-500">Vault</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 text-center md:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Revision-first DSA prep · {QUESTIONS.length} problems · {TOPICS.length} topics
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
          Don&apos;t just solve problems.{" "}
          <span className="bg-linear-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Remember them.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 md:text-lg">
          A checklist tells you what you solved. AlgoVault tells you what you&apos;re about to{" "}
          <em>forget</em> — with spaced repetition, your own notes &amp; solutions, and AI
          explanations that don&apos;t spoil the learning.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={cta}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40"
          >
            Start tracking — it&apos;s free
          </Link>
          <Link
            href={session ? "/problems" : "/sign-in"}
            className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Browse the sheet
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1.5 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
        AlgoVault — problems link to their original platforms; statements stay where they belong.
      </footer>
    </div>
  );
}
