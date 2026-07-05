import { describe, it, expect } from "vitest";
import {
  reconcileBenchmark,
  conformanceMismatches,
  enforceCanonicalFigures,
  validateGeneration,
} from "@/lib/validate-generation";
import { FLOOR_POLICY } from "@/lib/fallback-policy";
import type { Policy } from "@/lib/policy-schema";
import type { CompanyProfile } from "@/lib/profile";

// The floor is the Series C SaaS normal fixture.
const seriesC: CompanyProfile = {
  company_name: "Series C SaaS",
  headcount_band: "101-500",
  sector: "software",
  ai_maturity: "scaling",
  strictness: "normal",
};

describe("(1) benchmark reconciliation", () => {
  it("leaves a reconciled benchmark untouched", () => {
    // 90000 / (300 x 66.29) rounds to 4.5, which the floor already states.
    const { entry } = reconcileBenchmark(FLOOR_POLICY, seriesC);
    expect(entry).toBeNull();
  });

  it("overwrites a wrong multiple and rewrites the summary figure", () => {
    const doctored: Policy = {
      ...FLOOR_POLICY,
      meta: { ...FLOOR_POLICY.meta, summary: "Envelopes set at 2.0x sector median." },
      budgets: {
        ...FLOOR_POLICY.budgets,
        benchmark: { ...FLOOR_POLICY.budgets.benchmark, envelope_multiple_of_median: 2.0 },
      },
    };
    const { policy, entry } = reconcileBenchmark(doctored, seriesC);
    expect(entry).toMatchObject({ check: "benchmark", statedMultiple: 2.0, computedMultiple: 4.5, sectorMedian: 66.29 });
    expect(policy.budgets.benchmark.envelope_multiple_of_median).toBe(4.5);
    expect(policy.budgets.benchmark.sector_median_per_employee_usd).toBe(66.29);
    expect(policy.meta.summary).toContain("4.5x sector median");
    expect(policy.meta.summary).not.toContain("2.0x");
  });
});

describe("(2) verdict conformance", () => {
  it("passes a conformant normal policy", () => {
    expect(conformanceMismatches(FLOOR_POLICY, seriesC)).toEqual([]);
  });

  it("reports a normal-strictness verdict mismatch", () => {
    // Raise burn alert above e13's 87% so it no longer trips.
    const doctored: Policy = {
      ...FLOOR_POLICY,
      budgets: { ...FLOOR_POLICY.budgets, burn_alert_pct: 99 },
    };
    const mismatches = conformanceMismatches(doctored, seriesC);
    expect(mismatches).toContainEqual({ eventId: "e13", engineVerdict: "approved", expectedVerdict: "alert_burn" });
  });

  it("requires only the e6 block for loose and strict", () => {
    const loose: CompanyProfile = { ...seriesC, strictness: "loose" };
    // e13 diverging is fine at loose; only e6 matters.
    const doctored: Policy = {
      ...FLOOR_POLICY,
      budgets: { ...FLOOR_POLICY.budgets, burn_alert_pct: 99 },
    };
    expect(conformanceMismatches(doctored, loose)).toEqual([]);

    // But if e6 stops blocking, loose fails.
    const noBlock: Policy = {
      ...FLOOR_POLICY,
      agents: { ...FLOOR_POLICY.agents, max_retries_per_task: 999, kill_threshold_usd_per_hour: 999 },
    };
    expect(conformanceMismatches(noBlock, loose)).toContainEqual({
      eventId: "e6",
      engineVerdict: "approved",
      expectedVerdict: "blocked",
    });
  });
});

describe("(3) canonical figures", () => {
  it("leaves rationales that carry the canonical figures", () => {
    const { entries } = enforceCanonicalFigures(FLOOR_POLICY);
    expect(entries).toEqual([]);
  });

  it("replaces e6 and e10 rationales that drop the figures", () => {
    const doctored: Policy = {
      ...FLOOR_POLICY,
      rationales: {
        ...FLOOR_POLICY.rationales,
        e6: "The agent was suspended.",
        e10: "Overlapping tool flagged for review.",
      },
    };
    const { policy, entries } = enforceCanonicalFigures(doctored);
    expect(entries.map((e) => e.eventId).sort()).toEqual(["e10", "e6"]);
    expect(policy.rationales.e6.replace(/,/g, "")).toContain("1090");
    expect(policy.rationales.e10).toContain("840");
  });

  it("accepts the comma-formatted figure", () => {
    const doctored: Policy = {
      ...FLOOR_POLICY,
      rationales: { ...FLOOR_POLICY.rationales, e6: "Blocked. About 1,090 in burn prevented." },
    };
    const { entries } = enforceCanonicalFigures(doctored);
    expect(entries.find((e) => e.eventId === "e6")).toBeUndefined();
  });
});

describe("validateGeneration pipeline", () => {
  it("collects entries from all three checks", () => {
    const doctored: Policy = {
      ...FLOOR_POLICY,
      meta: { ...FLOOR_POLICY.meta, summary: "Envelopes set at 2.0x sector median." },
      budgets: {
        ...FLOOR_POLICY.budgets,
        burn_alert_pct: 85,
        benchmark: { ...FLOOR_POLICY.budgets.benchmark, envelope_multiple_of_median: 2.0 },
      },
      rationales: {
        ...FLOOR_POLICY.rationales,
        e1: "Blocked at the kill threshold.",
        e6: "The agent was suspended.",
      },
    };
    const { report } = validateGeneration(doctored, seriesC);
    expect(report.some((r) => r.check === "benchmark")).toBe(true);
    expect(report.some((r) => r.check === "rationale" && r.eventId === "e1")).toBe(true);
    expect(report.some((r) => r.check === "canonical" && r.eventId === "e6")).toBe(true);
  });
});
