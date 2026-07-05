import Link from "next/link";
import { BUILD_START, daysSince } from "@/lib/constants";

export function Hero() {
  const days = daysSince(BUILD_START);
  const dayLabel = days === 1 ? "day" : "days";

  return (
    <section id="hero" className="bg-ground px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-shell">
        <div className="max-w-prose">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
            Every company just acquired a third payroll. Nobody’s managing it.
          </h1>

          <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink/70 sm:text-xl">
            AI is the fastest-growing, most under-managed spend category in
            business. Seeing it was chapter one. Govern is a working concept for
            chapter two: policy, budgets, and enforcement for intelligence bought
            by the token.
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a
              href="#demo"
              className="rounded-md bg-accent px-6 py-3 text-base font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
            >
              Generate a policy →
            </a>
            <Link
              href="/memo"
              className="rounded-sm text-base font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
            >
              Read the memo
            </Link>
          </div>

          <p className="mt-8 font-mono text-sm text-ink/60">
            built in {days} {dayLabel} · one PM · working demo below
          </p>

          <p className="mt-16 text-xs text-ink/60">
            An independent concept project. Not affiliated with Ramp. Data cited
            from Ramp Economics Lab publications.
          </p>
        </div>
      </div>
    </section>
  );
}
