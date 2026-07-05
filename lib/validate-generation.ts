import type { Policy } from "@/lib/policy-schema";
import type { CompanyProfile } from "@/lib/profile";
import { events, type Verdict } from "@/data/events";
import { evaluate } from "@/lib/engine";
import { templateFromResult } from "@/lib/rationales";
import { validateRationales } from "@/lib/validate-rationales";
import { BENCHMARKS_MAY_2026 } from "@/data/ai-index";

// Headcount midpoints and the profile-sector to benchmark-row mapping, both taken
// exactly from prompts/policy-skill.md.
const MIDPOINT: Record<CompanyProfile["headcount_band"], number> = {
  "1-25": 15,
  "26-100": 60,
  "101-500": 300,
  "501-2000": 1200,
  "2000+": 4000,
};

const SECTOR_ROW: Record<
  CompanyProfile["sector"],
  keyof typeof BENCHMARKS_MAY_2026.bySector
> = {
  software: "Technology and media",
  ai_native: "Technology and media",
  services: "Professional, scientific, and technical services",
  retail: "Retail",
  manufacturing: "Manufacturing",
  healthcare: "Health care",
};

const round1 = (x: number): number => Math.round(x * 10) / 10;

export type ReportEntry =
  | {
      check: "benchmark";
      statedMultiple: number;
      computedMultiple: number;
      sectorMedian: number;
    }
  | {
      check: "rationale";
      eventId: string;
      reason: "verdict_mismatch" | "clause_reference";
      engineVerdict: Verdict;
      expectedVerdict: Verdict;
    }
  | { check: "canonical"; eventId: string; figure: string };

// The benchmark multiple the policy's envelope implies, given the profile's
// midpoint and sector median.
export function expectedBenchmarkMultiple(
  policy: Policy,
  profile: CompanyProfile,
): { computed: number; sectorMedian: number } {
  const sectorMedian = BENCHMARKS_MAY_2026.bySector[SECTOR_ROW[profile.sector]];
  const midpoint = MIDPOINT[profile.headcount_band];
  const computed = round1(
    policy.budgets.company_envelope_usd_month / (midpoint * sectorMedian),
  );
  return { computed, sectorMedian };
}

// (1) Recompute the benchmark multiple from the midpoint and sector median. If the
// stated value is off by more than 0.1, overwrite the benchmark block and rewrite
// the "Nx sector median" figure in the summary.
export function reconcileBenchmark(
  policy: Policy,
  profile: CompanyProfile,
): { policy: Policy; entry: Extract<ReportEntry, { check: "benchmark" }> | null } {
  const { computed, sectorMedian } = expectedBenchmarkMultiple(policy, profile);
  const stated = policy.budgets.benchmark.envelope_multiple_of_median;

  if (Math.abs(stated - computed) <= 0.1) return { policy, entry: null };

  const summary = policy.meta.summary.replace(
    /\d+(\.\d+)?x sector median/i,
    `${computed.toFixed(1)}x sector median`,
  );
  const next: Policy = {
    ...policy,
    meta: { ...policy.meta, summary },
    budgets: {
      ...policy.budgets,
      benchmark: {
        ...policy.budgets.benchmark,
        sector_median_per_employee_usd: sectorMedian,
        envelope_multiple_of_median: computed,
      },
    },
  };
  return {
    policy: next,
    entry: { check: "benchmark", statedMultiple: stated, computedMultiple: computed, sectorMedian },
  };
}

export interface Mismatch {
  eventId: string;
  engineVerdict: Verdict;
  expectedVerdict: Verdict;
}

export class ConformanceError extends Error {
  readonly mismatches: Mismatch[];
  constructor(mismatches: Mismatch[]) {
    super("verdict conformance failed");
    this.name = "ConformanceError";
    this.mismatches = mismatches;
  }
}

// (2) At normal strictness every verdict must match the event's expected verdict.
// At loose and strict only the e6 block invariant is required.
export function conformanceMismatches(
  policy: Policy,
  profile: CompanyProfile,
): Mismatch[] {
  if (profile.strictness === "normal") {
    const out: Mismatch[] = [];
    for (const event of events) {
      const verdict = evaluate(policy, event).verdict;
      if (verdict !== event.expectedVerdict) {
        out.push({ eventId: event.id, engineVerdict: verdict, expectedVerdict: event.expectedVerdict });
      }
    }
    return out;
  }
  const e6 = events.find((e) => e.id === "e6");
  const verdict = e6 ? evaluate(policy, e6).verdict : "approved";
  return verdict === "blocked"
    ? []
    : [{ eventId: "e6", engineVerdict: verdict, expectedVerdict: "blocked" }];
}

// (3) e6's rationale must carry 1,090 and e10's must carry 840 (comma optional).
// Otherwise replace with the deterministic template, which contains the figure.
const CANONICAL: { id: string; figure: string }[] = [
  { id: "e6", figure: "1090" },
  { id: "e10", figure: "840" },
];

export function enforceCanonicalFigures(policy: Policy): {
  policy: Policy;
  entries: Extract<ReportEntry, { check: "canonical" }>[];
} {
  const rationales = { ...policy.rationales };
  const entries: Extract<ReportEntry, { check: "canonical" }>[] = [];

  for (const { id, figure } of CANONICAL) {
    const key = id as keyof Policy["rationales"];
    const stripped = (rationales[key] ?? "").replace(/,/g, "");
    if (!new RegExp(`\\b${figure}\\b`).test(stripped)) {
      const event = events.find((e) => e.id === id);
      if (event) {
        rationales[key] = templateFromResult(policy, event, evaluate(policy, event));
        entries.push({ check: "canonical", eventId: id, figure });
      }
    }
  }
  return { policy: { ...policy, rationales }, entries };
}

// The deterministic post-schema pipeline: benchmark reconciliation, then rationale
// validation, then canonical figures. Verdict conformance is enforced earlier, in
// the generation retry loop.
export function validateGeneration(
  policy: Policy,
  profile: CompanyProfile,
): { policy: Policy; report: ReportEntry[] } {
  const benchmark = reconcileBenchmark(policy, profile);
  const rationale = validateRationales(benchmark.policy);
  const canonical = enforceCanonicalFigures(rationale.policy);

  const report: ReportEntry[] = [];
  if (benchmark.entry) report.push(benchmark.entry);
  for (const r of rationale.report) {
    report.push({
      check: "rationale",
      eventId: r.eventId,
      reason: r.reason,
      engineVerdict: r.engineVerdict,
      expectedVerdict: r.expectedVerdict,
    });
  }
  report.push(...canonical.entries);

  return { policy: canonical.policy, report };
}
