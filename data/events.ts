// data/events.ts
// The fixed 14-event stream for the enforcement simulator, transcribed verbatim
// from content/events-spec.md (Series C preset, normal strictness). Amounts,
// timestamps, verdicts, and fired clauses are final. expectedVerdict and
// expectedClauses are the test fixture the deterministic engine is asserted
// against. Do not invent events or change amounts.

export type Verdict =
  | "approved"
  | "approval_recommended"
  | "approval_required"
  | "flagged_variance"
  | "flagged_consolidation"
  | "rerouted_shadow"
  | "throttled"
  | "alert_burn"
  | "blocked"
  | "week_closed";

export type EventType =
  | "api_usage"
  | "variance"
  | "employee_card"
  | "fine_tune"
  | "agent_loop"
  | "routing_exception"
  | "usage_spike"
  | "agent_card"
  | "subscription"
  | "new_provider"
  | "classification"
  | "burn_pacing"
  | "week_close";

export interface Event {
  id: string; // "e1".."e14"
  timestamp: string; // label, verbatim, e.g. "Mon 09:14"
  type: EventType;
  description: string; // verbatim from events-spec.md
  team?: string; // the initiating team, where named

  // Numeric fields the engine reads. Only the ones an event needs are set.
  amountUsd?: number;
  amountUsdMonth?: number;
  dailyRunRateUsd?: number;
  estimatedUsd?: number;
  usdPerHour?: number;
  deltaUsd?: number;
  variancePct?: number;
  baselineMultiple?: number;
  retries?: number;
  teamSubscriptionCount?: number;
  competingUsdYear?: number;
  utilizationPct?: number;
  projectedSavingsUsdYear?: number;
  envelopePct?: number;
  daysRemaining?: number;

  // Test fixture, asserted against engine output.
  expectedVerdict: Verdict;
  expectedClauses: string[];
}

export const events: Event[] = [
  {
    id: "e1",
    timestamp: "Mon 09:14",
    type: "api_usage",
    description:
      "Production inference, support-triage service, Claude Sonnet, $211 daily run rate",
    team: "Support",
    dailyRunRateUsd: 211,
    expectedVerdict: "approved",
    expectedClauses: [
      "providers.allowlist",
      "budgets.team_envelope(Support)",
      "classification(COGS)",
    ],
  },
  {
    id: "e2",
    timestamp: "Mon 11:02",
    type: "api_usage",
    description: "Nightly embeddings job, Data team, $38",
    team: "Data",
    amountUsd: 38,
    expectedVerdict: "approved",
    expectedClauses: ["providers.allowlist", "budgets.team_envelope(Data)"],
  },
  {
    id: "e3",
    timestamp: "Tue 08:47",
    type: "variance",
    description:
      "Search team cost per request +96% overnight after deploy; volume unchanged",
    team: "Search",
    variancePct: 96,
    expectedVerdict: "flagged_variance",
    expectedClauses: ["budgets.variance_band", "response_ladder.step1"],
  },
  {
    id: "e4",
    timestamp: "Tue 14:30",
    type: "employee_card",
    description:
      "$30/mo ChatGPT Team subscription on Marketing employee card, third this quarter for the team",
    team: "Marketing",
    amountUsdMonth: 30,
    teamSubscriptionCount: 3,
    expectedVerdict: "rerouted_shadow",
    expectedClauses: [
      "shadow_ai.employee_card_ai_merchants",
      "shadow_ai.team_subscription_threshold",
    ],
  },
  {
    id: "e5",
    timestamp: "Wed 10:05",
    type: "fine_tune",
    description: "Fine-tune job request, ML Platform team, estimated $4,800",
    team: "ML Platform",
    estimatedUsd: 4800,
    expectedVerdict: "approval_recommended",
    expectedClauses: ["approvals.fine_tune_over_usd"],
  },
  {
    id: "e6",
    timestamp: "Wed 23:58",
    type: "agent_loop",
    description:
      "Autonomous research agent, Growth team, retry loop: 340 calls/hr, $47/hr, context growing each cycle",
    team: "Growth",
    retries: 340,
    usdPerHour: 47,
    expectedVerdict: "blocked",
    expectedClauses: [
      "agents.max_retries_per_task",
      "agents.kill_threshold_usd_per_hour",
    ],
  },
  {
    id: "e7",
    timestamp: "Thu 09:20",
    type: "routing_exception",
    description: "Growth team requests frontier-model exception for a demo build",
    team: "Growth",
    deltaUsd: 65,
    expectedVerdict: "approved",
    expectedClauses: ["routing.frontier_exception"],
  },
  {
    id: "e8",
    timestamp: "Fri 19:41",
    type: "usage_spike",
    description:
      "Junior engineer personal API key at 22x baseline, unattributed project tag",
    baselineMultiple: 22,
    expectedVerdict: "throttled",
    expectedClauses: ["response_ladder.step2"],
  },
  {
    id: "e9",
    timestamp: "Sat 10:12",
    type: "agent_card",
    description:
      "Procurement agent purchases $499 dataset license via its agent card",
    team: "Procurement",
    amountUsd: 499,
    expectedVerdict: "approved",
    expectedClauses: [
      "agents.agent_card.merchant_scopes",
      "agents.agent_card.single_txn_ceiling_usd",
    ],
  },
  {
    id: "e10",
    timestamp: "Sat 16:18",
    type: "subscription",
    description:
      "Design team trials AI video tool $89/mo; Sales already pays $1,400/yr for competing tool at 40% seat utilization",
    team: "Design",
    amountUsdMonth: 89,
    competingUsdYear: 1400,
    utilizationPct: 40,
    projectedSavingsUsdYear: 840,
    expectedVerdict: "flagged_consolidation",
    expectedClauses: ["shadow_ai (category overlap application)"],
  },
  {
    id: "e11",
    timestamp: "Sun 09:30",
    type: "new_provider",
    description: "First charge from unrecognized inference provider, $120, Engineering",
    team: "Engineering",
    amountUsd: 120,
    expectedVerdict: "approval_required",
    expectedClauses: ["providers.new_provider_rule"],
  },
  {
    id: "e12",
    timestamp: "Sun 11:44",
    type: "classification",
    description: "Inference tagged to internal tool misclassified as COGS",
    expectedVerdict: "approved",
    expectedClauses: ["classification.rules"],
  },
  {
    id: "e13",
    timestamp: "Sun 18:02",
    type: "burn_pacing",
    description:
      "Month-to-date AI spend at 87% of company envelope, 9 days remaining",
    envelopePct: 87,
    daysRemaining: 9,
    expectedVerdict: "alert_burn",
    expectedClauses: ["budgets.burn_alert_pct"],
  },
  {
    id: "e14",
    timestamp: "Sun 23:59",
    type: "week_close",
    description: "Weekly rollup",
    expectedVerdict: "week_closed",
    expectedClauses: [],
  },
];
