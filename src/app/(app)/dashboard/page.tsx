import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { activityLog, progress } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { QUESTIONS, TAGS, TOPICS, questionById } from "@/data/questions";
import { Card, Ring, TAG_DOT } from "@/components/ui";

export const dynamic = "force-dynamic";

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeAgo(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  const userId = user.id;

  const [rows, activity] = await Promise.all([
    db.select().from(progress).where(eq(progress.userId, userId)),
    db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(400),
  ]);

  // ── Progress stats ──
  const solvedRows = rows.filter((r) => r.status === "solved");
  const totalSolved = solvedRows.length;

  const byTag = new Map(TAGS.map((t) => [t, { total: 0, solved: 0 }]));
  for (const q of QUESTIONS) byTag.get(q.tag)!.total++;
  for (const r of solvedRows) {
    const q = questionById.get(r.questionId);
    if (q) byTag.get(q.tag)!.solved++;
  }

  const byTopic = new Map(TOPICS.map((t) => [t, { total: 0, solved: 0, confSum: 0, confN: 0 }]));
  for (const q of QUESTIONS) byTopic.get(q.topic)!.total++;
  for (const r of rows) {
    const q = questionById.get(r.questionId);
    if (!q) continue;
    const t = byTopic.get(q.topic)!;
    if (r.status === "solved") t.solved++;
    if (r.confidence != null) {
      t.confSum += r.confidence;
      t.confN++;
    }
  }

  // ── Revision health ──
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const weekAhead = new Date(endOfToday.getTime() + 7 * 86400000);
  const dueToday = rows.filter(
    (r) => r.status === "solved" && r.nextReviewAt && r.nextReviewAt <= endOfToday,
  ).length;
  const dueWeek = rows.filter(
    (r) => r.status === "solved" && r.nextReviewAt && r.nextReviewAt <= weekAhead,
  ).length;
  const flaggedNeverRevised = rows.filter((r) => r.needsRevision && !r.lastRevisedAt).length;
  const lowConfidence = rows.filter(
    (r) => r.status === "solved" && r.confidence != null && r.confidence <= 2,
  ).length;

  // ── Activity: heatmap + streaks ──
  const perDay = new Map<string, number>();
  for (const a of activity) {
    const k = dayKey(a.createdAt);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }

  let streak = 0;
  {
    const cursor = new Date(now);
    if (!perDay.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1); // today not yet active doesn't break it
    while (perDay.has(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const solvedThisWeek = activity.filter(
    (a) => a.action === "solved" && a.createdAt >= weekAgo,
  ).length;
  const revisedThisWeek = activity.filter(
    (a) => a.action === "revised" && a.createdAt >= weekAgo,
  ).length;

  // Heatmap: last 20 weeks, columns = weeks, rows = Sun..Sat
  const weeks: { key: string; count: number; inFuture: boolean }[][] = [];
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay() - 19 * 7); // Sunday, 20 weeks back
  for (let w = 0; w < 20; w++) {
    const col: { key: string; count: number; inFuture: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(start);
      cell.setDate(start.getDate() + w * 7 + d);
      col.push({
        key: dayKey(cell),
        count: perDay.get(dayKey(cell)) ?? 0,
        inFuture: cell > now,
      });
    }
    weeks.push(col);
  }
  const heatColor = (c: number) =>
    c === 0
      ? "bg-zinc-800/60"
      : c === 1
        ? "bg-lime-900"
        : c <= 3
          ? "bg-lime-700"
          : "bg-lime-400";

  const weakest = [...byTopic.entries()]
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => a[1].solved / a[1].total - b[1].solved / b[1].total)
    .slice(0, 3);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {totalSolved === 0 ? `Welcome, ${firstName}!` : `Keep going, ${firstName} 👋`}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {dueToday > 0
              ? `You have ${dueToday} problem${dueToday > 1 ? "s" : ""} due for revision today.`
              : totalSolved === 0
                ? "Pick your first problem and start the streak."
                : "Nothing due today — solve something new or get ahead."}
          </p>
        </div>
        <a
          href="/api/export"
          download
          className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-lime-400 hover:text-lime-400"
        >
          ⬇ Export my data
        </a>
      </div>

      {/* Top stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="flex items-center justify-center p-5">
          <Link href="/problems" className="text-center">
            <Ring
              value={totalSolved}
              total={QUESTIONS.length}
              label={`${totalSolved}`}
              sublabel={`of ${QUESTIONS.length}`}
            />
            <div className="mt-1 text-xs font-medium text-zinc-500">Problems solved</div>
          </Link>
        </Card>
        <Card className="flex flex-col justify-center p-5">
          <div className="text-3xl font-bold tabular-nums">
            {streak > 0 ? `🔥 ${streak}` : "—"}
          </div>
          <div className="mt-1 text-xs font-medium text-zinc-500">Day streak</div>
          <div className="mt-2 text-[11px] text-zinc-400">
            {solvedThisWeek} solved · {revisedThisWeek} revised this week
          </div>
        </Card>
        <Card className="p-0">
          <Link href="/revision" className="flex h-full flex-col justify-center p-5">
            <div className="text-3xl font-bold tabular-nums text-amber-500">{dueToday}</div>
            <div className="mt-1 text-xs font-medium text-zinc-500">Due for revision today</div>
            <div className="mt-2 text-[11px] text-zinc-400">{dueWeek} due within 7 days →</div>
          </Link>
        </Card>
        <Card className="p-0">
          <Link href="/revision" className="flex h-full flex-col justify-center p-5">
            <div className="text-3xl font-bold tabular-nums text-red-500">{lowConfidence}</div>
            <div className="mt-1 text-xs font-medium text-zinc-500">Low-confidence solves</div>
            <div className="mt-2 text-[11px] text-zinc-400">
              {flaggedNeverRevised} flagged, never revised →
            </div>
          </Link>
        </Card>
      </div>

      {/* Heatmap + difficulty */}
      <div className="mb-4 grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold">Activity — last 20 weeks</h2>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {weeks.map((col, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {col.map((cell) =>
                  cell.inFuture ? (
                    <div key={cell.key} className="size-3 rounded-[3px]" />
                  ) : (
                    <div
                      key={cell.key}
                      title={`${cell.key}: ${cell.count} ${cell.count === 1 ? "action" : "actions"}`}
                      className={`size-3 rounded-[3px] ${heatColor(cell.count)}`}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400">
            Less
            {[0, 1, 2, 4].map((c) => (
              <span key={c} className={`size-2.5 rounded-[3px] ${heatColor(c)}`} />
            ))}
            More
          </div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">By difficulty</h2>
          <div className="space-y-3">
            {TAGS.map((t) => {
              const c = byTag.get(t)!;
              const p = c.total ? (c.solved / c.total) * 100 : 0;
              return (
                <Link
                  key={t}
                  href={`/problems?level=${encodeURIComponent(t)}`}
                  className="block"
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className={`size-1.5 rounded-full ${TAG_DOT[t]}`} />
                      {t}
                    </span>
                    <span className="tabular-nums text-zinc-500">
                      {c.solved}/{c.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${TAG_DOT[t]}`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Topics + insights/feed */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold">Topic strength</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[...byTopic.entries()].map(([t, v]) => {
              const p = v.total ? Math.round((v.solved / v.total) * 100) : 0;
              return (
                <Link
                  key={t}
                  href={`/problems?topic=${encodeURIComponent(t)}`}
                  className="rounded-xl border border-zinc-800 px-3 py-2.5 transition-colors hover:border-lime-400/40"
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium">{t}</span>
                    <span className="shrink-0 tabular-nums text-zinc-500">
                      {v.solved}/{v.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${
                        p >= 70 ? "bg-lime-400" : p >= 30 ? "bg-amber-500" : "bg-red-400"
                      }`}
                      style={{ width: `${Math.max(p, 2)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Focus next</h2>
            {totalSolved === 0 ? (
              <p className="text-xs text-zinc-500">
                Solve a few problems and your weakest topics will show up here.
              </p>
            ) : (
              <ul className="space-y-2">
                {weakest.map(([t, v]) => (
                  <li key={t}>
                    <Link
                      href={`/problems?topic=${encodeURIComponent(t)}&status=Unsolved`}
                      className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-3 py-2 text-xs font-medium transition-colors hover:bg-lime-400/10"
                    >
                      <span>{t}</span>
                      <span className="text-zinc-500">
                        {v.solved}/{v.total} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="flex-1 p-5">
            <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
            {activity.length === 0 ? (
              <p className="text-xs text-zinc-500">No activity yet — go solve something!</p>
            ) : (
              <ul className="space-y-2.5">
                {activity.slice(0, 7).map((a) => {
                  const q = questionById.get(a.questionId);
                  if (!q) return null;
                  const icon =
                    a.action === "solved" ? "✅" : a.action === "revised" ? "🔁" : "✏️";
                  return (
                    <li key={a.id} className="flex items-center gap-2 text-xs">
                      <span>{icon}</span>
                      <Link
                        href={`/problems/${q.id}`}
                        className="min-w-0 flex-1 truncate font-medium hover:text-lime-400"
                      >
                        {q.title}
                      </Link>
                      <span className="shrink-0 text-zinc-400">{timeAgo(a.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
