import type { Policy } from "@/lib/policy-schema";
import { events } from "@/data/events";
import { evaluate } from "@/lib/engine";
import { templateFromResult } from "@/lib/rationales";

// The never-fails floor beneath the two-tier fallback. Hand-written, schema-valid,
// and covered by lib/fallback-policy.test.ts. This is deliberately NOT a generated
// preset: it is the deterministic ground the route stands on when live generation
// and every data/presets match are unavailable. Values are the normal-strictness
// calibration from prompts/policy-skill.md and match the Session 2 test fixture.
const core: Omit<Policy, "rationales"> = {
  meta: {
    company_name: "Series C SaaS",
    strictness: "normal",
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
    frontier_exception: {
      self_serve: false,
      window_hours: 72,
      approver: "Engineering lead",
      max_delta_usd: 300,
    },
  },
  budgets: {
    company_envelope_usd_month: 40000,
    team_envelopes: [
      { team: "Engineering", usd_month: 18000, variance_band_pct: 40, unit_cost_metric: "cost per merged PR" },
      { team: "Product", usd_month: 6000, variance_band_pct: 40, unit_cost_metric: "cost per shipped spec" },
      { team: "Support", usd_month: 4000, variance_band_pct: 40, unit_cost_metric: "cost per resolved ticket" },
      { team: "GTM", usd_month: 4000, variance_band_pct: 40, unit_cost_metric: "cost per qualified lead" },
      { team: "Data", usd_month: 4000, variance_band_pct: 40, unit_cost_metric: "cost per pipeline run" },
    ],
    burn_alert_pct: 85,
    benchmark: {
      sector_median_per_employee_usd: 66.29,
      envelope_multiple_of_median: 2.0,
      source: "Ramp AI Index, ramp.com/data, May 2026",
    },
  },
  agents: {
    max_retries_per_task: 25,
    max_context_growth_pct_per_loop: 30,
    kill_threshold_usd_per_hour: 45,
    agent_card: {
      enabled: true,
      single_txn_ceiling_usd: 1000,
      merchant_scopes: ["data_providers", "cloud_infra"],
    },
  },
  shadow_ai: {
    employee_card_ai_merchants: "reroute",
    team_subscription_threshold: 3,
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
    fine_tune_over_usd: 4000,
    contract_over_usd: 25000,
    new_provider_approver: "Engineering lead",
    frontier_exception_approver: "Engineering lead",
  },
  response_ladder: [
    { step: 1, trigger: "variance band breached", action: "alert", window_hours: 24, owner: "Team lead" },
    { step: 2, trigger: "usage above baseline multiple", action: "throttle", window_hours: 48, owner: "Engineering lead" },
    { step: 3, trigger: "kill threshold exceeded", action: "block", window_hours: 1, owner: "Platform on-call" },
  ],
};

const withPlaceholder: Policy = { ...core, rationales: {} as Policy["rationales"] };
const rationales = Object.fromEntries(
  events.map((e) => [
    e.id,
    templateFromResult(withPlaceholder, e, evaluate(withPlaceholder, e)),
  ]),
) as Policy["rationales"];

export const FLOOR_POLICY: Policy = { ...core, rationales };
