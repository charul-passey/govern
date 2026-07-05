import { AdoptionChart } from "@/components/AdoptionChart";

// Citation mark. Rendered at caption text size and raised, so it reads as a
// citation, not an exponent (per content/site-copy.md).
function Cite({ n }: { n: number }) {
  return <sup className="ml-0.5 font-normal text-ink/50">{n}</sup>;
}

function StatCard({
  value,
  caption,
  note,
  highlight = false,
}: {
  value: string;
  caption: string;
  note: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-md bg-accent p-5"
          : "rounded-md border border-ink/10 bg-ground p-5"
      }
    >
      <div className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        {value}
      </div>
      <p className={highlight ? "mt-2 text-sm text-ink/70" : "mt-2 text-sm text-ink/60"}>
        {caption}
        <Cite n={note} />
      </p>
    </div>
  );
}

export function Problem() {
  return (
    <section id="problem" className="bg-ground px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-shell">
        <h2 className="sr-only">The problem</h2>

        {/* Data wall. 13x carries the single yellow highlight. Copy verbatim from
            content/site-copy.md. */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            value="13×"
            caption="growth in average monthly AI token spend since January 2025"
            note={1}
            highlight
          />
          <StatCard
            value="54.2%"
            caption="share of U.S. businesses now paying for AI services"
            note={2}
          />
          <StatCard
            value="3×"
            caption="year-over-year growth in AI charges surfacing as employee reimbursements"
            note={3}
          />
          <StatCard
            value="54×"
            caption="gap between the median company and the top decile in monthly AI spend per employee"
            note={3}
          />
        </div>

        <AdoptionChart />

        {/* Body, five paragraphs, verbatim. Apostrophes rendered typographically. */}
        <div className="mt-12 max-w-prose space-y-4 text-lg leading-relaxed text-ink/80">
          <p>
            Every system a company uses to control spending makes the same three
            assumptions: a human decides to spend, at human speed, at a price
            agreed in advance. Payroll works this way. Vendor contracts work this
            way. The corporate card works this way, too. Swipe, policy check,
            approval.
          </p>
          <p>
            Token billing breaks all three assumptions at once. Spend is initiated
            by software, at machine speed, at prices that float with usage. A
            prompt-template change can triple a bill overnight. An agent stuck in a
            retry loop can burn a quarter’s budget before Monday standup. And on
            the invoice, a junior engineer’s Friday-night experiment looks
            identical to production inference.
          </p>
          <p>
            Finance teams know it. AI charges are leaking onto personal cards and
            coming back as reimbursements, up 3× in a year.
            <Cite n={3} /> The most sophisticated control publicly deployed at
            scale is a flat monthly cap per employee.
            <Cite n={4} /> That is a seat-era instrument aimed at a usage-era
            problem. A cap rations spend, punishes the teams whose AI use is
            actually working, and governs nothing.
          </p>
          <p>
            The market’s answer so far is visibility: dashboards that show where
            the tokens went. Visibility is necessary. It is also where every
            product on the market stops. A dashboard reports the fire. Policy
            decides which fires can’t start. For people and for vendors, that
            policy layer took decades to build. For intelligence, it doesn’t exist
            yet.
          </p>
          <p className="text-ink">
            What would it look like if it did?{" "}
            <a
              href="#demo"
              className="rounded-sm font-semibold text-ink underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
            >
              Generate one and find out. ↓
            </a>
          </p>
        </div>

        {/* Citations. The only sanctioned place the word Ramp may appear in UI. */}
        <div className="mt-12 border-t border-ink/10 pt-6">
          <ol className="max-w-prose list-decimal space-y-1 pl-5 text-xs text-ink/50 marker:text-ink/40">
            <li>Ramp Economics Lab, Business Spending Report, Spring 2026.</li>
            <li>Ramp AI Index, ramp.com/data, May 2026.</li>
            <li>
              Ramp AI Index dataset, May 2026: median monthly AI spend per
              employee $11.38; top-decile median $610.61.
            </li>
            <li>
              Reported enterprise per-employee AI budget cap. TechCrunch, June
              2026.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
