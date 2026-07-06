import { describe, it, expect } from "vitest";
import { evaluate, computeTally } from "@/lib/engine";
import { events, type Event, type EventType } from "@/data/events";
import { policySchema, type Policy } from "@/lib/policy-schema";

// Fixture policy factory. Values are the normal-strictness calibration from
// prompts/policy-skill.md, with loose and strict variants for the e6 invariant.
// Every fixture is run through policySchema.parse, so the tests also prove the
// fixture is a valid policy shape.
type Strictness = "loose" | "normal" | "strict";

const CAL = {
  loose: { retries: 50, ctx: 60, kill: 80, band: 60, burn: 90, sub: 5, card: "flag", self: true, win: 168, appr: "Engineering lead", delta: 1000, fine: 20000 },
  normal: { retries: 25, ctx: 30, kill: 45, band: 40, burn: 85, sub: 3, card: "reroute", self: false, win: 72, appr: "Engineering lead", delta: 300, fine: 4000 },
  strict: { retries: 12, ctx: 15, kill: 20, band: 20, burn: 72, sub: 1, card: "reroute", self: false, win: 24, appr: "CFO", delta: 100, fine: 1000 },
} as const;

function makePolicy(strictness: Strictness): Policy {
  const c = CAL[strictness];
  return policySchema.parse({
    meta: {
      company_name: "Series C SaaS",
      strictness,
      summary: "Envelopes set at 2.0x sector median.",
    },
    providers: {
      allowlist: [
        { name: "Anthropic", tier: "primary", data_terms_reviewed: true },
        { name: "OpenAI", tier: "secondary", data_terms_reviewed: true },
      ],
      new_provider_rule: { action: "require_approval", approver: "Engineering lead" },
    },
    routing: {
      default_tier: "efficient",
      frontier_exception: { self_serve: c.self, window_hours: c.win, approver: c.appr, max_delta_usd: c.delta },
    },
    budgets: {
      company_envelope_usd_month: 90000,
      team_envelopes: [
        { team: "Engineering", usd_month: 40000, variance_band_pct: c.band, unit_cost_metric: "cost per merged PR" },
        { team: "Product", usd_month: 12000, variance_band_pct: c.band, unit_cost_metric: "cost per shipped spec" },
        { team: "Support", usd_month: 9000, variance_band_pct: c.band, unit_cost_metric: "cost per resolved ticket" },
        { team: "GTM", usd_month: 10000, variance_band_pct: c.band, unit_cost_metric: "cost per qualified lead" },
        { team: "Data", usd_month: 9000, variance_band_pct: c.band, unit_cost_metric: "cost per pipeline run" },
      ],
      burn_alert_pct: c.burn,
      benchmark: { sector_median_per_employee_usd: 66.29, envelope_multiple_of_median: 2.0, source: "Ramp AI Index, ramp.com/data, May 2026" },
    },
    agents: {
      max_retries_per_task: c.retries,
      max_context_growth_pct_per_loop: c.ctx,
      kill_threshold_usd_per_hour: c.kill,
      agent_card: { enabled: true, single_txn_ceiling_usd: 1000, merchant_scopes: ["data_providers", "cloud_infra"] },
    },
    shadow_ai: {
      employee_card_ai_merchants: c.card,
      team_subscription_threshold: c.sub,
      reimbursement_rule: "Flag AI subscription reimbursements after the first per team.",
    },
    classification: {
      default_class: "OpEx",
      rules: [
        { match: "environment", value: "production", class: "COGS" },
        { match: "project_tag", value: "internal-tools", class: "OpEx" },
      ],
    },
    approvals: {
      fine_tune_over_usd: c.fine,
      contract_over_usd: 25000,
      new_provider_approver: "Engineering lead",
      frontier_exception_approver: c.appr,
    },
    response_ladder: [
      { step: 1, trigger: "variance band breached", action: "alert", window_hours: 24, owner: "Team lead" },
      { step: 2, trigger: "usage above baseline multiple", action: "throttle", window_hours: 48, owner: "Engineering lead" },
      { step: 3, trigger: "kill threshold exceeded", action: "block", window_hours: 1, owner: "Platform on-call" },
    ],
    rationales: Object.fromEntries(events.map((e) => [e.id, `${e.id} rationale`])),
  });
}

const normal = makePolicy("normal");

describe("evaluate: fourteen-event fixture at normal strictness", () => {
  for (const event of events) {
    it(`${event.id} ${event.type} -> ${event.expectedVerdict}`, () => {
      const result = evaluate(normal, event);
      expect(result.verdict).toBe(event.expectedVerdict);
      expect(result.firedClauses).toEqual(event.expectedClauses);
    });
  }
});

describe("invariant: e6 agent loop is blocked at every strictness", () => {
  const e6 = events.find((e) => e.id === "e6")!;

  it("is blocked at loose, normal, and strict", () => {
    for (const s of ["loose", "normal", "strict"] as const) {
      expect(evaluate(makePolicy(s), e6).verdict).toBe("blocked");
    }
  });

  it("fires only the retries clause at loose", () => {
    expect(evaluate(makePolicy("loose"), e6).firedClauses).toEqual([
      "agents.max_retries_per_task",
    ]);
  });

  it("fires both retries and kill clauses at normal and strict", () => {
    for (const s of ["normal", "strict"] as const) {
      expect(evaluate(makePolicy(s), e6).firedClauses).toEqual([
        "agents.max_retries_per_task",
        "agents.kill_threshold_usd_per_hour",
      ]);
    }
  });
});

describe("tally strip is engine-derived", () => {
  const tally = computeTally(normal, events);

  it("blocks $1,090 of runaway burn", () => expect(tally.blockedBurnUsd).toBe(1090));
  it("reroutes $1,080/yr to negotiated contracts", () => expect(tally.reroutedUsdYear).toBe(1080));
  it("identifies $840/yr of consolidation", () => expect(tally.consolidationUsdYear).toBe(840));
  it("catches one runaway agent", () => expect(tally.agentsCaught).toBe(1));
});

// Policy variants and a synthetic-event helper used only to exercise the
// alternate side of each defensive guard. Every guard in the engine is kept;
// these fixtures walk the paths the fixed fourteen-event stream never reaches.
const blockPolicy: Policy = {
  ...normal,
  providers: {
    ...normal.providers,
    new_provider_rule: { action: "block", approver: "CFO" },
  },
};
const allowPolicy: Policy = {
  ...normal,
  providers: {
    ...normal.providers,
    new_provider_rule: { action: "allow_with_review", approver: "Engineering lead" },
  },
};
// Band of 200 is above the loose calibration ceiling (70); with a realistic band
// e3's 96% breaches at every strictness, so covering the not-breached branch needs
// a deliberately wide band.
const wideBandPolicy: Policy = {
  ...normal,
  budgets: {
    ...normal.budgets,
    team_envelopes: normal.budgets.team_envelopes.map((t) => ({
      ...t,
      variance_band_pct: 200,
    })),
  },
};

function ev(partial: Partial<Event> & { type: EventType }): Event {
  return {
    id: "synthetic",
    timestamp: "Test",
    description: "branch coverage fixture",
    expectedVerdict: "approved",
    expectedClauses: [],
    ...partial,
  };
}

describe("branch coverage: alternate guard paths in evaluate", () => {
  it("fine-tune under the approval threshold is approved", () => {
    expect(evaluate(normal, ev({ type: "fine_tune", estimatedUsd: 500 })).verdict).toBe("approved");
  });
  it("fine-tune with no estimate defaults under the threshold", () => {
    expect(evaluate(normal, ev({ type: "fine_tune" })).verdict).toBe("approved");
  });
  it("agent loop within limits is approved with no clauses", () => {
    const r = evaluate(normal, ev({ type: "agent_loop" }));
    expect(r.verdict).toBe("approved");
    expect(r.firedClauses).toEqual([]);
  });
  it("frontier exception over the delta cap requires approval", () => {
    expect(evaluate(normal, ev({ type: "routing_exception", deltaUsd: 5000 })).verdict).toBe("approval_required");
  });
  it("frontier exception with no delta stays within the cap", () => {
    expect(evaluate(normal, ev({ type: "routing_exception" })).verdict).toBe("approved");
  });
  it("agent card over the ceiling requires approval", () => {
    expect(evaluate(normal, ev({ type: "agent_card", amountUsd: 5000 })).verdict).toBe("approval_required");
  });
  it("agent card with no amount stays within the ceiling", () => {
    expect(evaluate(normal, ev({ type: "agent_card" })).verdict).toBe("approved");
  });
  it("new provider is blocked under block mode", () => {
    expect(evaluate(blockPolicy, ev({ type: "new_provider" })).verdict).toBe("blocked");
  });
  it("new provider is approved under allow-with-review mode", () => {
    expect(evaluate(allowPolicy, ev({ type: "new_provider" })).verdict).toBe("approved");
  });
  it("burn pacing under the alert threshold is approved", () => {
    expect(evaluate(normal, ev({ type: "burn_pacing", envelopePct: 50 })).verdict).toBe("approved");
  });
  it("burn pacing with no percentage is approved", () => {
    expect(evaluate(normal, ev({ type: "burn_pacing" })).verdict).toBe("approved");
  });
  it("variance within a wide band does not flag", () => {
    expect(evaluate(wideBandPolicy, ev({ type: "variance", variancePct: 96 })).verdict).toBe("approved");
  });
  it("variance with no percentage does not flag", () => {
    expect(evaluate(normal, ev({ type: "variance" })).verdict).toBe("approved");
  });
});

describe("employee_card compares subscription count to the threshold", () => {
  const e4 = events.find((e) => e.id === "e4")!;

  it("is approved below the threshold, citing only the threshold clause", () => {
    // loose threshold is 5, e4 count is 3.
    const r = evaluate(makePolicy("loose"), e4);
    expect(r.verdict).toBe("approved");
    expect(r.firedClauses).toEqual(["shadow_ai.team_subscription_threshold"]);
  });

  it("applies the reroute mode at or above the threshold", () => {
    // normal threshold is 3, e4 count is 3.
    expect(evaluate(makePolicy("normal"), e4).verdict).toBe("rerouted_shadow");
  });

  it("approves at or above the threshold when the mode is allow", () => {
    const base = makePolicy("normal");
    const allowMode: Policy = {
      ...base,
      shadow_ai: {
        ...base.shadow_ai,
        team_subscription_threshold: 1,
        employee_card_ai_merchants: "allow",
      },
    };
    expect(evaluate(allowMode, e4).verdict).toBe("approved");
  });

  it("treats a missing count as zero, below any positive threshold", () => {
    expect(evaluate(normal, ev({ type: "employee_card" })).verdict).toBe("approved");
  });
});

describe("branch coverage: tally guards skip verdict-matching events missing their amounts", () => {
  it("adds nothing when the amount fields are absent", () => {
    // Threshold zero makes the employee_card events reroute even without a count,
    // exercising both null guards in the reroute tally branch.
    const zero: Policy = {
      ...normal,
      shadow_ai: { ...normal.shadow_ai, team_subscription_threshold: 0 },
    };
    const tally = computeTally(zero, [
      ev({ type: "agent_loop", retries: 999 }), // blocked, no projectedOvernightUsd
      ev({ type: "employee_card" }), // rerouted, no teamSubscriptionCount
      ev({ type: "employee_card", teamSubscriptionCount: 3 }), // rerouted, no amountUsdMonth
      ev({ type: "subscription" }), // consolidation, no projectedSavingsUsdYear
    ]);
    expect(tally.blockedBurnUsd).toBe(0);
    expect(tally.reroutedUsdYear).toBe(0);
    expect(tally.consolidationUsdYear).toBe(0);
    expect(tally.agentsCaught).toBe(0);
  });
});
