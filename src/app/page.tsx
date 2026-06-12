import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { QUESTIONS, TOPICS } from "@/data/questions";
import { BHAIYA_SHEETS } from "@/data/bhaiyaSheets";
import { ThemeToggle } from "@/components/ThemeToggle";

// ── Topic icons (inline SVG paths keyed by topic) ────────────────
const TOPIC_ICONS: Record<string, string> = {
  "Arrays":                    "M4 6h16M4 10h16M4 14h16M4 18h16",
  "Strings":                   "M4 6h16M4 12h10M4 18h13",
  "Hashing":                   "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  "Sorting & Searching":       "M3 4h13M3 8h9m-9 4h9m5-4v12m0 0-4-4m4 4 4-4",
  "Two Pointers & Sliding Window": "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  "Linked List":               "M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1",
  "Stack & Queue":             "M4 7h16M4 12h16M4 17h16",
  "Recursion & Backtracking":  "M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15",
  "Binary Search Advanced":    "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  "Trees":                     "M12 2L6 7l6 5 6-5-6-5zM3 17l9-5 9 5M3 12l9-5 9 5",
  "BST":                       "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 1-2-2z",
  "Heaps":                     "M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "Graphs":                    "M9 3 3 9l6 6m6-12 6 6-6 6",
  "Dynamic Programming":       "M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2",
  "Greedy":                    "M13 10V3L4 14h7v7l9-11h-7z",
  "Trie":                      "M3 21v-4m0 0V5a2 2 0 0 1 2-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 0 0-2 2zm9-13.5V9",
  "Bit Manipulation":          "M10 20l4-16m4 4-4 4 4 4M6 16l-4-4 4-4",
  "Math & Number Theory":      "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z",
  "Matrix":                    "M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zM4 13a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6zM16 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-6z",
  "Custom":                    "M12 6v6m0 0v6m0-6h6m-6 0H6",
};

const DEFAULT_ICON = "M12 6v6m0 0v6m0-6h6m-6 0H6";

function TopicIcon({ topic }: { topic: string }) {
  const d = TOPIC_ICONS[topic] ?? DEFAULT_ICON;
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const TAG_COLORS: Record<string, string> = {
  easy:    "bg-lime-400/15 text-lime-300 border border-lime-400/20",
  "easy+": "bg-lime-400/10 text-lime-200 border border-lime-400/15",
  medium:  "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  "medium+":"bg-orange-500/15 text-orange-400 border border-orange-500/20",
  hard:    "bg-red-500/15 text-red-400 border border-red-500/20",
};

export default async function Home() {
  const { isAuthenticated } = await auth();
  const authed = isAuthenticated;
  const cta = authed ? "/dashboard" : "/sign-up";

  const totalEasy   = QUESTIONS.filter(q => q.tag === "easy" || q.tag === "easy+").length;
  const totalMedium = QUESTIONS.filter(q => q.tag === "medium" || q.tag === "medium+").length;
  const totalHard   = QUESTIONS.filter(q => q.tag === "hard").length;

  // Topic stats for the grid section
  const topicStats = TOPICS.map(topic => ({
    topic,
    count: QUESTIONS.filter(q => q.topic === topic).length,
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">

      {/* ── Sticky nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-lime-400 to-lime-600 shadow-lg shadow-lime-400/20 group-hover:shadow-lime-400/30 transition-shadow">
              <svg className="size-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Algo<span className="text-lime-300">Vault</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {[
              { href: authed ? "/problems" : "#features", label: "Problems" },
              { href: authed ? "/bhaiya-sheets" : "#sheets", label: "Sheets" },
              { href: authed ? "/revision" : "#features", label: "Revision" },
              { href: authed ? "/visualizers" : "#features", label: "Visualizers" },
            ].map(({ href, label }) => (
              <Link key={label} href={href} className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {authed ? (
              <Link href="/dashboard" className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300 hover:shadow-lime-400/30">
                Open app →
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden text-sm text-zinc-400 transition-colors hover:text-zinc-100 sm:block">
                  Sign in
                </Link>
                <Link href="/sign-up" className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-lime-400/20 transition-all hover:bg-lime-300">
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950">
        {/* Grid + radial glow */}
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.12),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 md:pt-28 md:pb-36">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left — copy */}
            <div>
              <div className="animate-in mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-4 py-1.5 text-xs font-medium text-lime-300">
                <span className="size-1.5 rounded-full bg-lime-300 animate-pulse" />
                SM-2 spaced repetition · Groq AI · {QUESTIONS.length} curated problems
              </div>

              <h1 className="animate-in delay-100 text-5xl font-black tracking-tight leading-[1.05] md:text-6xl">
                Stop re-solving.<br />
                <span className="gradient-text">Start remembering.</span>
              </h1>

              <p className="animate-in delay-200 mt-6 text-lg leading-relaxed text-zinc-400 max-w-lg">
                The forgetting curve is brutal. AlgoVault fights it — spaced repetition tells you <em className="text-zinc-300 not-italic font-medium">exactly what to review today</em>, AI explains without spoiling, and your notes stay forever.
              </p>

              <div className="animate-in delay-300 mt-8 flex flex-wrap items-center gap-3">
                <Link href={cta} className="glow-emerald-sm rounded-xl bg-lime-400 px-6 py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-lime-300 hover:scale-[1.02]">
                  Start tracking — free
                </Link>
                <Link href={authed ? "/problems" : "/sign-in"} className="rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-500 hover:text-zinc-100">
                  Browse {QUESTIONS.length} problems →
                </Link>
              </div>

              {/* Stats pills */}
              <div className="animate-in delay-400 mt-10 flex flex-wrap gap-4">
                {[
                  { n: QUESTIONS.length, label: "Problems" },
                  { n: TOPICS.length,    label: "Topics" },
                  { n: 7,                label: "Educator sheets" },
                  { n: 11,               label: "Visualizers" },
                ].map(({ n, label }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-2xl font-black text-zinc-100">{n}<span className="text-lime-300">+</span></span>
                    <span className="text-xs text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock UI card */}
            <div className="animate-in delay-300 animate-float hidden lg:block">
              <div className="glow-emerald rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur overflow-hidden shadow-2xl">
                {/* Mock header */}
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-red-500/80" />
                    <div className="size-2.5 rounded-full bg-amber-500/80" />
                    <div className="size-2.5 rounded-full bg-lime-400/80" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">algvault.app/problems</span>
                  <div className="size-4" />
                </div>
                {/* Mock problem rows */}
                <div className="divide-y divide-zinc-800/50">
                  {[
                    { n: "1.", title: "Two Sum",                   tag: "easy",   solved: true,  stars: 4, next: "Tomorrow" },
                    { n: "2.", title: "Valid Parentheses",         tag: "easy",   solved: true,  stars: 3, next: "In 3 days" },
                    { n: "3.", title: "Longest Substring No Repeat",tag:"medium", solved: false, stars: 2, next: "Not started" },
                    { n: "4.", title: "Merge Two Sorted Lists",    tag: "easy",   solved: false, stars: 0, next: "Not started" },
                    { n: "5.", title: "Maximum Subarray",          tag: "medium", solved: true,  stars: 5, next: "In 7 days" },
                  ].map((q) => (
                    <div key={q.title} className="flex items-center gap-3 px-4 py-2.5">
                      <div className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${q.solved ? "bg-lime-400/20 text-lime-300" : "border border-zinc-700 text-zinc-600"}`}>
                        {q.solved ? "✓" : ""}
                      </div>
                      <span className={`flex-1 truncate text-xs font-medium ${q.solved ? "text-zinc-400" : "text-zinc-200"}`}>{q.n} {q.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {q.stars > 0 && (
                          <span className="text-[10px] text-amber-400">{"★".repeat(q.stars)}{"☆".repeat(5 - q.stars)}</span>
                        )}
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${TAG_COLORS[q.tag]}`}>{q.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Mock footer */}
                <div className="border-t border-zinc-800 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">3 / 5 solved · 40%</span>
                  <div className="h-1.5 flex-1 mx-4 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-[40%] rounded-full bg-linear-to-r from-lime-400 to-lime-500" />
                  </div>
                  <span className="text-[11px] text-lime-300 font-medium">2 due today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Difficulty strip ───────────────────────────────────────── */}
      <div className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-12 px-6 py-5 flex-wrap">
          {[
            { label: "Easy",    count: totalEasy,   color: "text-lime-300" },
            { label: "Medium",  count: totalMedium, color: "text-amber-400" },
            { label: "Hard",    count: totalHard,   color: "text-red-400" },
            { label: "Topics",  count: TOPICS.length, color: "text-lime-400" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className={`text-3xl font-black tabular-nums ${color}`}>{count}</span>
              <span className="text-sm text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature 01 — Spaced Repetition ────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold tracking-widest text-lime-400 uppercase">01 — Never Forget</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Anki-style revision.<br />
              <span className="gradient-text">Built for DSA.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-zinc-400">
              Every problem you solve seeds a review on the SM-2 algorithm — just like Anki. Rate your recall <strong className="text-zinc-300 font-semibold">Again / Hard / Good / Easy</strong> and the interval adapts. Problems you struggle with come back sooner. Problems you know well? Weeks later.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Due-today queue — never miss a revision",
                "Low-confidence problems always surfaced first",
                "Confidence stars (1–5) per problem",
                "Streak counter and 20-week heatmap",
              ].map(s => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <span className="mt-0.5 size-4 shrink-0 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center text-[10px]">✓</span>
                  {s}
                </li>
              ))}
            </ul>
            <Link href={cta} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200 transition-colors">
              Start your revision streak →
            </Link>
          </div>

          {/* Revision mock UI */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
            <div className="border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">Revision due today</span>
              <span className="rounded-full bg-red-500/15 border border-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400">4 due</span>
            </div>
            <div className="divide-y divide-zinc-800/40">
              {[
                { title: "Longest Common Subsequence", topic: "Dynamic Programming", stars: 3, tag: "hard" },
                { title: "Binary Tree Level Order",     topic: "Trees",               stars: 2, tag: "medium" },
                { title: "Coin Change",                 topic: "Dynamic Programming", stars: 4, tag: "medium" },
                { title: "Valid Parentheses",           topic: "Stack & Queue",        stars: 5, tag: "easy" },
              ].map((q) => (
                <div key={q.title} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <svg className="size-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-200">{q.title}</p>
                    <p className="text-[11px] text-zinc-500">{q.topic}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-amber-400">{"★".repeat(q.stars)}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${TAG_COLORS[q.tag]}`}>{q.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 px-5 py-3 flex gap-2">
              <div className="flex-1 rounded-lg bg-lime-400/10 border border-lime-400/20 py-2 text-center text-xs font-bold text-lime-300">Good</div>
              <div className="flex-1 rounded-lg bg-zinc-800 py-2 text-center text-xs font-medium text-zinc-400">Hard</div>
              <div className="flex-1 rounded-lg bg-zinc-800 py-2 text-center text-xs font-medium text-zinc-400">Again</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 02 — AI Hints ──────────────────────────────────── */}
      <section className="border-y border-zinc-800/40 bg-zinc-900/20">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* AI mock UI — left */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl order-2 lg:order-1">
              <div className="border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="size-2 rounded-full bg-lime-300 animate-pulse" />
                  <span className="text-sm font-semibold text-zinc-200">AI Explanation</span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Hint 2 of 4</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 leading-relaxed">
                  Think about what data structure gives you <span className="text-lime-300 font-medium">O(1) lookup</span>. You need to check if a complement exists for each element...
                </div>
                <div className="flex gap-2">
                  {["Hint 1", "Hint 2", "Approach", "Solution"].map((step, i) => (
                    <div key={step} className={`flex-1 rounded-lg py-1.5 text-center text-[10px] font-semibold ${i === 1 ? "bg-lime-400/20 border border-lime-400/30 text-lime-300" : i < 1 ? "bg-zinc-800 text-zinc-400" : "bg-zinc-900 border border-zinc-800 text-zinc-600"}`}>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-800 pt-3 flex items-center gap-2">
                  <span className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400">Explain simpler</span>
                  <span className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400">Hinglish mode</span>
                </div>
              </div>
            </div>

            {/* Copy — right */}
            <div className="order-1 lg:order-2">
              <p className="mb-3 text-sm font-bold tracking-widest text-lime-400 uppercase">02 — AI that teaches</p>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Hints that guide.<br />
                <span className="gradient-text">Never spoil.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-zinc-400">
                Powered by Groq (llama-3.3-70b), every problem has 4 staged hints — each one nudges you forward without giving the answer away. Only request what you need.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Hint → Approach → Complexity → Full Solution",
                  "'Explain simpler' for extra clarity",
                  "Hinglish mode for native learners",
                  "All responses cached — zero duplicate API calls",
                ].map(s => (
                  <li key={s} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <span className="mt-0.5 size-4 shrink-0 rounded-full bg-lime-400/20 text-lime-300 flex items-center justify-center text-[10px]">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature 03 — Bhaiya Sheets ────────────────────────────── */}
      <section id="sheets" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold tracking-widest text-lime-400 uppercase">03 — Every sheet you love</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Import. Track.<br />
              <span className="gradient-text">Own your progress.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-zinc-400">
              Love Striver? Babbar? Apna College? One click imports any popular sheet into your tracker — complete with status, notes, stars, revision, AI hints, and code runner. Or paste a LeetCode/GFG URL and add any problem instantly.
            </p>
            <Link href={authed ? "/bhaiya-sheets" : cta} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200 transition-colors">
              Browse all sheets →
            </Link>
          </div>

          {/* Sheets grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {BHAIYA_SHEETS.slice(0, 6).map((sheet) => (
              <div key={sheet.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-zinc-200 leading-snug">{sheet.name}</p>
                  <span className="shrink-0 rounded-lg bg-zinc-800 px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">{sheet.questionCount}+</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate">{sheet.author}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {sheet.topics.slice(0, 3).map(t => (
                    <span key={t} className="rounded-md bg-lime-400/8 px-1.5 py-0.5 text-[10px] text-lime-400">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature 04 — Visualizers + Code runner ─────────────────── */}
      <section className="border-y border-zinc-800/40 bg-zinc-900/20">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Visualizer mock */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
              <div className="border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Bubble Sort Visualizer</span>
                <div className="flex gap-2">
                  <span className="rounded-lg bg-lime-400/15 border border-lime-400/20 px-2.5 py-1 text-[10px] font-bold text-lime-300">▶ Play</span>
                  <span className="rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-[10px] text-zinc-400">⟲ Reset</span>
                </div>
              </div>
              <div className="p-5">
                {/* Array bars */}
                <div className="flex items-end gap-1.5 h-24 mb-4">
                  {[64, 34, 25, 12, 22, 11, 90, 45, 78, 56].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${(h / 90) * 100}%` }}
                      className={`flex-1 rounded-t-sm transition-all ${i === 0 ? "bg-lime-400" : i === 1 ? "bg-lime-400" : "bg-zinc-700"}`}
                    />
                  ))}
                </div>
                {/* Step counter */}
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Step 3 / 45</span>
                  <span className="text-zinc-400">Comparing indices <span className="text-lime-300 font-mono">0</span> and <span className="text-lime-300 font-mono">1</span></span>
                </div>
                <div className="mt-3 h-1 rounded-full bg-zinc-800">
                  <div className="h-full w-[7%] rounded-full bg-linear-to-r from-lime-400 to-lime-500" />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div>
              <p className="mb-3 text-sm font-bold tracking-widest text-lime-400 uppercase">04 — See it before you code it</p>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                11 algorithm<br />
                <span className="gradient-text">visualizers.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-zinc-400">
                Step through algorithms frame by frame. Play, pause, scrub, randomize. Watch the array sort, the tree grow, the BFS spread — <em className="text-zinc-300 not-italic">then</em> write the code.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {["Bubble Sort", "Merge Sort", "Quick Sort", "Binary Search", "BFS Grid", "DFS Grid", "Two Pointers", "Sliding Window", "Kadane's Algo", "Insertion Sort", "Selection Sort"].slice(0,8).map(v => (
                  <div key={v} className="flex items-center gap-2 text-xs text-zinc-500">
                    <div className="size-1.5 rounded-full bg-lime-400/60" />
                    {v}
                  </div>
                ))}
              </div>
              <Link href={authed ? "/visualizers" : cta} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-lime-300 hover:text-lime-200 transition-colors">
                Open visualizers →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Topics grid (Crackr-style phases) ─────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-bold tracking-widest text-lime-400 uppercase">The problem set</p>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">
            {QUESTIONS.length} problems across<br />
            <span className="gradient-text">{TOPICS.length} topics</span>
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">Curated for placement prep — progressive difficulty within every topic, from arrays to tries.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topicStats.map(({ topic, count }) => (
            <Link
              key={topic}
              href={authed ? `/problems?topic=${encodeURIComponent(topic)}` : cta}
              className="group flex items-center gap-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3.5 transition-all hover:border-lime-400/30 hover:bg-zinc-900/80"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-lime-400/10 border border-lime-400/15 text-lime-300 group-hover:bg-lime-400/15 transition-colors">
                <TopicIcon topic={topic} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">{topic}</p>
                <p className="text-xs text-zinc-500">{count} problems</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-zinc-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(16,185,129,0.08),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center md:py-36">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/8 px-4 py-1.5 text-xs font-medium text-lime-300">
            Free to start. Always.
          </div>
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Ready to actually<br />
            <span className="gradient-text">remember your DSA?</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Join engineers who track smarter, revise on schedule, and walk into interviews knowing their solutions cold.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href={cta} className="glow-emerald rounded-xl bg-lime-400 px-8 py-3.5 text-base font-bold text-zinc-950 transition-all hover:bg-lime-300 hover:scale-[1.02]">
              {authed ? "Go to dashboard →" : "Start for free →"}
            </Link>
            {!authed && (
              <Link href="/sign-in" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Already have an account? Sign in
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-lime-400 to-lime-600">
                  <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4.5 13.5H11L9 22l10.5-13H13.5L15 2z"/></svg>
                </div>
                <span className="font-bold">Algo<span className="text-lime-300">Vault</span></span>
              </Link>
              <p className="text-xs text-zinc-500 leading-relaxed">Revision-first DSA tracker for placement prep.</p>
            </div>

            {/* Practice */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Practice</p>
              <ul className="space-y-2">
                {[
                  { href: authed ? "/problems" : "/sign-in", label: "Problems" },
                  { href: authed ? "/revision" : "/sign-in", label: "Revision" },
                  { href: authed ? "/mock" : "/sign-in",     label: "Mock Interview" },
                  { href: authed ? "/bhaiya-sheets" : "/sign-in", label: "Bhaiya Sheets" },
                ].map(({ href, label }) => (
                  <li key={label}><Link href={href} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Learn */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Learn</p>
              <ul className="space-y-2">
                {[
                  { href: authed ? "/visualizers" : "/sign-in", label: "Visualizers" },
                  { href: authed ? "/sheets" : "/sign-in",      label: "My Sheets" },
                  { href: authed ? "/dashboard" : "/sign-in",   label: "Dashboard" },
                ].map(({ href, label }) => (
                  <li key={label}><Link href={href} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Account</p>
              <ul className="space-y-2">
                {(authed
                  ? [{ href: "/dashboard", label: "Dashboard" }]
                  : [{ href: "/sign-in", label: "Sign in" }, { href: "/sign-up", label: "Get started" }]
                ).map(({ href, label }) => (
                  <li key={label}><Link href={href} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-zinc-800/60 pt-6 sm:flex-row">
            <p className="text-xs text-zinc-600">© 2026 AlgoVault · Built for engineers, by engineers</p>
            <p className="text-xs text-zinc-600">Problems link to their original platforms — statements stay where they belong.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
