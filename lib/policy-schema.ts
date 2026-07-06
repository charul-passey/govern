import { z } from "zod";

// Single source of truth for the policy shape. Mirrors the JSON contract in
// prompts/policy-skill.md exactly. Used to validate LLM output, render the JSON
// pane, and type the rules engine input. Pinned constants are literals; closed
// sets are enums; numbers and strings stay unconstrained so calibration lives at
// generation time, not in this validation gate.

export const strictnessSchema = z.enum(["loose", "normal", "strict"]);

const metaSchema = z.object({
  company_name: z.string(),
  strictness: strictnessSchema,
  summary: z.string(),
});

const providersSchema = z.object({
  allowlist: z.array(
    z.object({
      name: z.string(),
      tier: z.enum(["primary", "secondary"]),
      data_terms_reviewed: z.boolean(),
    }),
  ),
  new_provider_rule: z.object({
    action: z.enum(["block", "require_approval", "allow_with_review"]),
    approver: z.string(),
  }),
});

const routingSchema = z.object({
  default_tier: z.literal("efficient"),
  frontier_exception: z.object({
    self_serve: z.boolean(),
    window_hours: z.number(),
    approver: z.string(),
    max_delta_usd: z.number(),
  }),
});

const budgetsSchema = z.object({
  company_envelope_usd_month: z.number(),
  team_envelopes: z.array(
    z.object({
      team: z.string(),
      usd_month: z.number(),
      variance_band_pct: z.number(),
      unit_cost_metric: z.string(),
    }),
  ),
  burn_alert_pct: z.number(),
  benchmark: z.object({
    sector_median_per_employee_usd: z.number(),
    envelope_multiple_of_median: z.number(),
    source: z.literal("Ramp AI Index, ramp.com/data, May 2026"),
  }),
});

const agentsSchema = z.object({
  max_retries_per_task: z.number(),
  max_context_growth_pct_per_loop: z.number(),
  kill_threshold_usd_per_hour: z.number(),
  agent_card: z.object({
    enabled: z.boolean(),
    single_txn_ceiling_usd: z.number(),
    merchant_scopes: z.array(z.string()),
  }),
});

const shadowAiSchema = z.object({
  employee_card_ai_merchants: z.enum(["reroute", "flag", "allow"]),
  team_subscription_threshold: z.number(),
  reimbursement_rule: z.string(),
});

const classificationSchema = z.object({
  default_class: z.literal("OpEx"),
  rules: z.array(
    z.object({
      match: z.enum(["project_tag", "environment"]),
      value: z.string(),
      class: z.enum(["COGS", "OpEx"]),
    }),
  ),
});

const approvalsSchema = z.object({
  fine_tune_over_usd: z.number(),
  contract_over_usd: z.number(),
  new_provider_approver: z.string(),
  frontier_exception_approver: z.string(),
});

// Always three ordered steps: alert, throttle, block.
const responseLadderSchema = z.tuple([
  z.object({
    step: z.literal(1),
    trigger: z.string(),
    action: z.literal("alert"),
    window_hours: z.number(),
    owner: z.string(),
  }),
  z.object({
    step: z.literal(2),
    trigger: z.string(),
    action: z.literal("throttle"),
    window_hours: z.number(),
    owner: z.string(),
  }),
  z.object({
    step: z.literal(3),
    trigger: z.string(),
    action: z.literal("block"),
    window_hours: z.number(),
    owner: z.string(),
  }),
]);

// One rationale per event id, all fourteen required.
export const rationalesSchema = z.object({
  e1: z.string(),
  e2: z.string(),
  e3: z.string(),
  e4: z.string(),
  e5: z.string(),
  e6: z.string(),
  e7: z.string(),
  e8: z.string(),
  e9: z.string(),
  e10: z.string(),
  e11: z.string(),
  e12: z.string(),
  e13: z.string(),
  e14: z.string(),
});

export const policySchema = z.object({
  meta: metaSchema,
  providers: providersSchema,
  routing: routingSchema,
  budgets: budgetsSchema,
  agents: agentsSchema,
  shadow_ai: shadowAiSchema,
  classification: classificationSchema,
  approvals: approvalsSchema,
  response_ladder: responseLadderSchema,
  rationales: rationalesSchema,
});

export type Policy = z.infer<typeof policySchema>;

// The policy without rationales, used for phase-one (fast) generation. The full
// schema, presets, and floor are unchanged; this is additive.
export const policyCoreSchema = policySchema.omit({ rationales: true });
export type PolicyCore = z.infer<typeof policyCoreSchema>;

export type Rationales = z.infer<typeof rationalesSchema>;
