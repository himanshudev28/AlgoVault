import Link from "next/link";
import { VISUALIZERS } from "@/lib/visualizers";

export const metadata = { title: "Visualizers — AlgoVault" };

export default function VisualizersPage() {
  const topics = [...new Set(VISUALIZERS.map((v) => v.topic))];
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Algorithm Visualizers</h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500">
        Watch the core algorithms run step by step — play, pause, scrub, randomize.
      </p>

      {topics.map((topic) => (
        <section key={topic} className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-zinc-500 uppercase tracking-wide">
            {topic}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VISUALIZERS.filter((v) => v.topic === topic).map((v) => (
              <Link
                key={v.slug}
                href={`/visualizers/${v.slug}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="mb-2 text-2xl">{v.icon}</div>
                <h3 className="font-semibold transition-colors group-hover:text-emerald-500">
                  {v.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{v.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
