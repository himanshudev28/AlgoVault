<div align="center">

# ⚡ AlgoVault

### A revision-first DSA tracker built for placement prep

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-00E5CC?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![Clerk Auth](https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge)](https://groq.com/)

**215 curated problems · SM-2 spaced repetition · AI explanations · Bhaiya Sheets · Mock Interviews · Algorithm Visualizers**

</div>

---

## What is AlgoVault?

AlgoVault is a full-stack DSA practice tracker that goes beyond a simple checklist. It combines spaced repetition scheduling, AI-powered hints, in-browser code execution, and a rich problem management system — all tied to your account so progress follows you everywhere.

---

## Features

### Problems & Progress
- **215 curated problems** across 20 topics with difficulty tagging (Easy / Easy+ / Medium / Medium+ / Hard)
- One-click status cycle — `Not Started → Attempting → Solved`
- Per-problem **notes editor** and **solution code** (C++, Java, Python, JS) with autosave
- **Confidence stars** (1–5), bookmark flag, and revision flag per problem
- Filter & search by topic, difficulty, status, bookmark, revision-due

### Dashboard
- Solved ring, day streak counter, and 20-week activity heatmap
- Difficulty split doughnut and topic strength grid
- **"Focus next"** — surfaces your weakest topics automatically
- Every card deep-links into the filtered problem list

### Spaced Repetition (SM-2)
- Solving a problem seeds a first review for the next day
- Rate recall: **Again / Hard / Good / Easy** — interval adapts via the SM-2 algorithm
- Due-today queue shown in the **Revision** tab
- Flagged (`needs revision`) and low-confidence problems are always queued

### AI Help (Groq)
- Staged hints that never spoil the answer: **Hint → Approach → Complexity → Full Solution**
- **"Explain simpler"** and **Hinglish** modes
- All AI responses cached in Postgres by prompt hash (no duplicate API calls)

### Bhaiya Sheets
Popular DSA sheets from top educators — one-click import straight into your tracker:

| Sheet | Author | Problems |
|---|---|---|
| Striver A2Z DSA | Striver (TakeUForward) | 355 |
| Love Babbar 450 | Love Babbar | 450 |
| LeadCoding by Fraz | Fraz | 250 |
| Arsh Goyal 45-Day Plan | Arsh Goyal | 280 |
| Apna College DSA | Shradha & Aman | 375 |
| Siddharth Singh 450 | Siddharth Singh | 450 |
| The Code Skool DSA | The Code Skool | 100+ |

Once imported, every sheet gets the full tracker treatment — status, notes, stars, revision, AI explain, and code runner.

### My Sheets & Custom Imports
- **Fetch from URL** — paste a LeetCode or GFG problem link to auto-fetch title, description, difficulty, and tags; saves directly to any of your sheets
- **CSV** — upload file or paste raw text; smart column detection handles sheets with metadata rows (e.g. Apna College)
- **PDF** — AI extracts problems from text-based PDFs (Groq)
- **Manual** — build a sheet from scratch row by row
- **My Imports tab** in the Problems page shows all your custom questions alongside the built-in catalog
- **Duplicate detection** — warns if you try to add a problem already in the sheet
- **Reimport** — re-fetch source CSV for any Bhaiya Sheet to fix column-mapping issues in existing data
- **Auto-fix names** — bulk-corrects questions where URLs were stored as titles instead of readable names

### Sheet Management
- **Inline rename** — click the sheet title to rename it in place
- **Inline edit** — edit title, link, topic, and difficulty for any question without leaving the page
- **Inline delete** — remove questions with a single click
- **Question numbers** — every row shows its position in the sheet (stays correct when searching/filtering)
- **+ Add Question** — global button to add a problem to any sheet from anywhere in the Problems page

### Mock Interview
- Pick topics, problem count, and duration
- Real countdown timer — results saved to progress on finish

### Algorithm Visualizers
11 step-through visualizers with play / pause / scrub / randomize:
- Bubble, Insertion, Selection, Merge, Quick Sort
- Binary Search, Two Pointers, Sliding Window
- Kadane's Algorithm, BFS Grid, DFS Grid

### Code Runner
- Run your solution in **C++ / Java / Python / JavaScript**
- Custom stdin, output panel — powered by the free Wandbox API

### Export
- Download all your progress, notes, and custom sheets as JSON — your data, always.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, RSC) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | Neon Postgres (serverless) |
| ORM | Drizzle ORM |
| Auth | Clerk (email/password + Google one-click) |
| AI | Groq (llama-3.3-70b-versatile) |
| Code execution | Wandbox API |
| Problem fetch | LeetCode GraphQL API + Jina Reader |
| Spaced repetition | SM-2 algorithm |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application
- A [Groq](https://groq.com) API key

### Installation

```bash
git clone https://github.com/himanshudev28/AlgoVault.git
cd AlgoVault
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
# Neon Postgres
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Groq
GROQ_API_KEY=gsk_...
```

### Database Setup

```bash
npx drizzle-kit push
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── (app)/               # Authenticated pages
│   │   ├── dashboard/       # Dashboard with stats & heatmap
│   │   ├── problems/        # Problem list + [id] detail + My Imports tab
│   │   ├── revision/        # SM-2 revision queue
│   │   ├── sheets/          # My Sheets — custom imports + sheet detail
│   │   ├── bhaiya-sheets/   # Bhaiya Sheets — popular DSA sheets
│   │   ├── mock/            # Mock Interview
│   │   └── visualizers/     # Algorithm visualizers
│   ├── api/
│   │   ├── progress/        # CRUD for problem progress
│   │   ├── revision/        # SM-2 scheduler endpoint
│   │   ├── sheets/          # Sheet CRUD + CSV/PDF parse
│   │   │   ├── question/    # Custom question edit & delete
│   │   │   ├── fix-titles/  # Bulk-fix URL-as-title data in DB
│   │   │   └── reimport/    # Re-fetch CSV and update questions in-place
│   │   ├── bhaiya-sheets/   # Bhaiya sheet auto-import
│   │   ├── fetch-problem/   # LeetCode/GFG problem fetcher
│   │   ├── ai/explain/      # Staged AI hints (Groq)
│   │   ├── run/             # Code runner (Wandbox)
│   │   └── export/          # JSON export
│   ├── sign-in/             # Clerk sign-in
│   └── sign-up/             # Clerk sign-up
├── components/
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── StatusButton.tsx     # Status cycle button
│   ├── Stars.tsx            # Confidence rating stars
│   ├── AddQuestionPanel.tsx # Add question via URL fetch or manual entry
│   ├── RunPanel.tsx         # In-browser code runner
│   ├── ThemeToggle.tsx      # Dark/light toggle
│   └── ui.tsx               # Shared UI primitives
├── data/
│   ├── questions.ts         # 215-problem static catalog
│   └── bhaiyaSheets.ts      # Bhaiya sheets catalog (incl. Striver A2Z static data)
├── db/
│   ├── schema.ts            # Drizzle schema
│   └── index.ts             # DB client
└── lib/
    ├── session.ts           # Clerk session helpers
    ├── sm2.ts               # SM-2 spaced repetition
    ├── groq.ts              # Groq AI client + cache
    ├── csv.ts               # Smart CSV parser (auto-detects header row & columns)
    ├── markdown.ts          # Markdown renderer
    ├── visualizers.ts       # Visualizer frame generators
    ├── useProgress.ts       # Progress state hook
    └── useSheets.ts         # Sheets state hook
```

---

## Database Schema

```
progress          — per-user, per-question: status, notes, code, SM-2 fields
activity_log      — append-only log for heatmap & streaks
ai_cache          — Groq response cache keyed by prompt hash
sheets            — user-created/imported sheet metadata
custom_questions  — questions belonging to a sheet (ids start at 100 000)
```

---

## Notes

- Problem **statements** are not hosted — every problem links to LeetCode/GFG (copyright).
- Auth is **Clerk**: email/password + Google one-click sign-in. For production, create a Clerk production instance with your own OAuth credentials.
- The Bhaiya Sheets import fetches directly from public Google Sheets CSV exports — no scraping.
- All imported sheet data is stored in **your** account's database rows — fully portable.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

<div align="center">

Built with ❤️ by [Himanshu](https://github.com/himanshudev28)

</div>
