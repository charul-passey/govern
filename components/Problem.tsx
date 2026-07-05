export function Problem() {
  return (
    <section id="problem" className="bg-ground px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-shell">
        <h2 className="sr-only">The problem</h2>

        {/* Data wall: four cited stat cards. 13x carries the single yellow highlight. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-md bg-accent p-5">
            <div className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              13×<sup className="ml-0.5 font-semibold text-ink/70">1</sup>
            </div>
            <p className="mt-2 text-sm text-ink/70">
              growth in average monthly AI token spend since Jan 2025
            </p>
          </div>

          <div className="rounded-md border border-ink/10 bg-ground p-5">
            <div className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              50.4%<sup className="ml-0.5 font-semibold text-ink/50">2</sup>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              share of U.S. businesses paying for AI
            </p>
          </div>

          <div className="rounded-md border border-ink/10 bg-ground p-5">
            <div className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              3×<sup className="ml-0.5 font-semibold text-ink/50">3</sup>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              YoY growth in AI-related reimbursements = shadow AI on personal cards
            </p>
          </div>

          <div className="rounded-md border border-ink/10 bg-ground p-5">
            <div className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              4–15×<sup className="ml-0.5 font-semibold text-ink/50">4</sup>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              top-quartile vs median AI spend variance by vendor
            </p>
          </div>
        </div>

        {/* Argument, rendered as the spec wrote it. Em dash converted to a period;
            the visibility citation moved to footnote 5 to keep the body company-neutral. */}
        <div className="mt-12 max-w-prose space-y-4">
          <p className="text-lg leading-relaxed text-ink/80">
            Seat-based budgeting assumes humans initiate spend at human speed;
            token billing is machine-initiated, volatile, and invisible to every
            control built for the first two pillars (people, vendors).
          </p>
          <p className="text-lg leading-relaxed text-ink/80">
            The state of the art for control today is a flat per-employee cap. A
            seat-era instrument aimed at a usage-era problem.
          </p>
          <p className="text-lg leading-relaxed text-ink/80">
            Visibility products solved <em>seeing</em>.
            <sup className="ml-0.5 font-semibold text-ink/50">5</sup>
          </p>
          <p className="text-xl font-semibold text-ink">
            Nobody has solved <em>governing</em>.
          </p>
        </div>

        {/* Closing line links into the demo. New copy, not from the spec. */}
        <p className="mt-10 max-w-prose">
          <a
            href="#demo"
            className="rounded-sm text-base font-semibold text-ink underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
          >
            Generate one and find out ↓
          </a>
        </p>

        {/* Citations. The only sanctioned place the word Ramp may appear in UI. */}
        <div className="mt-12 border-t border-ink/10 pt-6">
          <ol className="max-w-prose list-decimal space-y-1 pl-5 text-xs text-ink/50 marker:text-ink/40">
            <li>Ramp Economics Lab, Spring 2026 report.</li>
            <li>Ramp AI Index, Mar 2026.</li>
            <li>Ramp, “How to buy AI.”</li>
            <li>Ramp, “How to buy AI.” Same report as note 3.</li>
            <li>Includes Ramp’s own AI visibility launch, April 2026.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
