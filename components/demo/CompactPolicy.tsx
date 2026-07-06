import type { PolicyCore } from "@/lib/policy-schema";
import { SECTION_TITLES } from "@/components/demo/PolicyDocument";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

// Compact Step 2 view: the summary, the company envelope with its benchmark chip,
// then the seven policy section titles as collapsed rows. The full document is one
// expand away (Read the full policy), handled by the parent.
export function CompactPolicy({ policy }: { policy: PolicyCore }) {
  const b = policy.budgets;

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink/70">{policy.meta.summary}</p>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-ink/10 pb-2">
        <span className="text-sm text-ink/60">Company envelope</span>
        <span className="text-right text-sm font-medium text-ink">
          {usd(b.company_envelope_usd_month)}/mo
          <span className="ml-2 inline-block whitespace-nowrap rounded-full bg-panel px-2 py-0.5 font-mono text-xs text-ink/60">
            {b.benchmark.envelope_multiple_of_median.toFixed(1)}× sector median
          </span>
        </span>
      </div>

      <ul>
        {SECTION_TITLES.map((title) => (
          <li
            key={title}
            className="border-b border-ink/5 py-2 text-xs font-semibold uppercase tracking-wide text-ink/50 last:border-b-0"
          >
            {title}
          </li>
        ))}
      </ul>
    </div>
  );
}
