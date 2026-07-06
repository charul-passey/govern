import Link from "next/link";
import { BUILD_DAYS } from "@/lib/constants";

export function Hero() {
  const days = BUILD_DAYS;
  const dayLabel = days === 1 ? "day" : "days";

  return (
    <section id="hero" className="bg-ground px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-shell">
        <div className="max-w-prose">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-6xl">
            Every company just hired a third workforce. Nobody’s managing its
            budget.
          </h1>

          <div className="mt-6 max-w-prose space-y-4 text-lg leading-relaxed text-ink/70 sm:text-xl">
            <p>
              AI is the fastest-growing, most under-managed spend category in
              business. It’s initiated by software, billed by the token, and
              invisible to every control built for people and vendors. Seeing it
              was chapter one.
            </p>
            <p>
              Govern is a working concept for chapter two: policy, budget
              instruments, and enforcement for intelligence.
            </p>
          </div>

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
              Read the memo <span aria-hidden="true">→</span>
            </Link>
          </div>

          <Link
            href="/build-log"
            className="mt-8 inline-block rounded-sm font-mono text-sm text-ink/60 no-underline underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
          >
            built in {days} {dayLabel} · one PM · working demo below
          </Link>
        </div>
      </div>
    </section>
  );
}
