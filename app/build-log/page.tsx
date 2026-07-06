import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { BUILD_DAYS } from "@/lib/constants";
import { TrackOnMount } from "@/components/TrackOnMount";

export const metadata: Metadata = {
  title: "Build log · Govern",
  description: "How this was built: spec-first, agent-executed, human-reviewed.",
};

type Day = { marker: string; entries: string[] };

// Group the log by day marker. Several entries share a "## Day N · Date" header;
// each day renders once, with its entries as separate blocks beneath it.
function parseDays(raw: string): Day[] {
  const days: Day[] = [];
  for (const line of raw.split("\n")) {
    const t = line.replace(/\s+$/, "");
    if (t.trim() === "") continue;
    if (t.startsWith("## ")) {
      const marker = t.slice(3);
      if (days.length === 0 || days[days.length - 1].marker !== marker) {
        days.push({ marker, entries: [] });
      }
    } else if (t.startsWith("# ")) {
      continue; // file-meta headers, not rendered
    } else if (days.length) {
      days[days.length - 1].entries.push(t);
    }
  }
  return days;
}

export default function BuildLogPage() {
  const raw = fs.readFileSync(path.join(process.cwd(), "content/build-log.md"), "utf8");
  const days = parseDays(raw);

  return (
    <main className="mx-auto max-w-prose px-6 py-16">
      <TrackOnMount event="build_log_opened" />
      <nav className="mb-12 print:hidden">
        <Link
          href="/"
          className="rounded-sm font-mono text-sm text-ink/50 underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          ← <span className="uppercase tracking-widest">Govern</span>
        </Link>
      </nav>

      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink">Build log</h1>
        <p className="mt-3 text-lg text-ink/60">
          How this was built: spec-first, agent-executed, human-reviewed.
        </p>
        <p className="mt-4 font-mono text-sm text-ink/50">Built in {BUILD_DAYS} days</p>
      </header>

      <div className="mt-12 space-y-12">
        {days.map((day) => (
          <section key={day.marker}>
            <h2 className="text-2xl font-bold tracking-tight text-ink">{day.marker}</h2>
            <div className="mt-6 space-y-6">
              {day.entries.map((entry, i) => (
                <p key={i} className="text-lg leading-relaxed text-ink/80">
                  {entry}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
