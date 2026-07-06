import { describe, it, expect } from "vitest";
import {
  reconcileBenchmark,
  enforceEnvelopeMagnitude,
  enforceTeamSum,
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
    // 40000 / (300 x 66.29) rounds to 2.0, which the floor already states.
    const { entry } = reconcileBenchmark(FLOOR_POLICY, seriesC);
    expect(entry).toBeNull();
  });

  it("overwrites a wrong multiple and rewrites the summary figure", () => {
    const doctored: Policy = {
      ...FLOOR_POLICY,
      meta: { ...FLOOR_POLICY.meta, summary: "Envelopes set at 5.0x sector median." },
      budgets: {
        ...FLOOR_POLICY.budgets,
        benchmark: { ...FLOOR_POLICY.budgets.benchmark, envelope_multiple_of_median: 5.0 },
      },
    };
    const { policy, entry } = reconcileBenchmark(doctored, seriesC);
    expect(entry).toMatchObject({ check: "benchmark", statedMultiple: 5.0, computedMultiple: 2.0, sectorMedian: 66.29 });
    expect(policy.budgets.benchmark.envelope_multiple_of_median).toBe(2.0);
    expect(policy.budgets.benchmark.sector_median_per_employee_usd).toBe(66.29);
    expect(policy.meta.summary).toContain("2.0x sector median");
    expect(policy.meta.summary).not.toContain("5.0x");
  });
});

describe("(2) envelope magnitude", () => {
  it("leaves an in-band scaling envelope untouched", () => {
    // The floor is 2.0x, inside the scaling band [1.5, 2.5].
    expect(enforceEnvelopeMagnitude(FLOOR_POLICY, seriesC).entry).toBeNull();
  });

  it("clamps a 12.1x scaling envelope down to 2x", () => {
    const inflated = Math.round(12.1 * 300 * 66.29);
    const doctored: Policy = {
      ...FLOOR_POLICY,
      meta: { ...FLOOR_POLICY.meta, summary: "Envelopes set at 12.1x sector median." },
      budgets: {
        ...FLOOR_POLICY.budgets,
        company_envelope_usd_month: inflated,
        benchmark: { ...FLOOR_POLICY.budgets.benchmark, envelope_multiple_of_median: 12.1 },
      },
    };
    const { policy, entry } = enforceEnvelopeMagnitude(doctored, seriesC);
    expect(entry?.check).toBe("envelope");
    expect(policy.budgets.company_envelope_usd_month).toBe(40000);
    expect(policy.budgets.benchmark.envelope_multiple_of_median).toBe(2.0);
    expect(policy.meta.summary).toContain("2.0x sector median");
  });

  it("clamps a 1.5x experimenting envelope to ~0.5x and preserves the team sum %", () => {
    const exp: CompanyProfile = {
      company_name: "Mfg",
      headcount_band: "501-2000",
      sector: "manufacturing",
      ai_maturity: "experimenting",
      strictness: "normal",
    };
    // manufacturing 501-2000: midpoint 1200, median 7.69. 14000 is ~1.5x.
    const doctored: Policy = {
      ...FLOOR_POLICY,
      meta: { ...FLOOR_POLICY.meta, summary: "Envelopes set at 1.5x sector median." },
      budgets: {
        ...FLOOR_POLICY.budgets,
        company_envelope_usd_month: 14000,
        team_envelopes: [
          { team: "Ops", usd_month: 7000, variance_band_pct: 40, unit_cost_metric: "cost per line" },
          { team: "Quality", usd_month: 5600, variance_band_pct: 40, unit_cost_metric: "cost per audit" },
        ],
        benchmark: { ...FLOOR_POLICY.budgets.benchmark, envelope_multiple_of_median: 1.5 },
      },
    };
    const before = 12600 / 14000;
    const { policy, entry } = enforceEnvelopeMagnitude(doctored, exp);
    expect(entry?.check).toBe("envelope");
    const mult = policy.budgets.benchmark.envelope_multiple_of_median;
    expect(mult).toBeGreaterThanOrEqual(0.4);
    expect(mult).toBeLessThanOrEqual(0.7);
    const sum = policy.budgets.team_envelopes.reduce((s, t) => s + t.usd_month, 0);
    const after = sum / policy.budgets.company_envelope_usd_month;
    expect(Math.abs(after - before)).toBeLessThan(0.02);
  });
});

describe("team envelope sum band", () => {
  it("leaves an in-band team sum untouched", () => {
    // The floor sums to 90% of the company envelope.
    expect(enforceTeamSum(FLOOR_POLICY).entry).toBeNull();
  });

  it("rescales a 96% team sum back into band", () => {
    const doctored: Policy = {
      ...FLOOR_POLICY,
      budgets: {
        ...FLOOR_POLICY.budgets,
        // Sum 38400 against the 40000 envelope = 96%.
        team_envelopes: [
          { team: "Engineering", usd_month: 19200, variance_band_pct: 40, unit_cost_metric: "cost per merged PR" },
          { team: "Product", usd_month: 6400, variance_band_pct: 40, unit_cost_metric: "cost per shipped spec" },
          { team: "Support", usd_month: 4400, variance_band_pct: 40, unit_cost_metric: "cost per resolved ticket" },
          { team: "GTM", usd_month: 4400, variance_band_pct: 40, unit_cost_metric: "cost per qualified lead" },
          { team: "Data", usd_month: 4000, variance_band_pct: 40, unit_cost_metric: "cost per pipeline run" },
        ],
      },
    };
    const { policy, entry } = enforceTeamSum(doctored);
    expect(entry).toMatchObject({ check: "team_sum", statedPct: 96 });
    const sum = policy.budgets.team_envelopes.reduce((s, t) => s + t.usd_month, 0);
    const pct = sum / policy.budgets.company_envelope_usd_month;
    expect(pct).toBeGreaterThanOrEqual(0.85);
    expect(pct).toBeLessThanOrEqual(0.95);
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
    // Envelope stays in band (2.0x) so no clamp; benchmark multiple is wrong (5.0)
    // so it reconciles; e1 names an unfired clause; e6 drops the canonical figure.
    const doctored: Policy = {
      ...FLOOR_POLICY,
      meta: { ...FLOOR_POLICY.meta, summary: "Envelopes set at 5.0x sector median." },
      budgets: {
        ...FLOOR_POLICY.budgets,
        benchmark: { ...FLOOR_POLICY.budgets.benchmark, envelope_multiple_of_median: 5.0 },
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
