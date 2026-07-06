import type { Policy } from "@/lib/policy-schema";
import type { Event, Verdict } from "@/data/events";
import type { EvalResult } from "@/lib/engine";

const VERDICT_LEDE: Record<Verdict, string> = {
  approved: "Approved.",
  approval_recommended: "Approval recommended.",
  approval_required: "Approval required.",
  flagged_variance: "Flagged as a variance breach.",
  flagged_consolidation: "Flagged for consolidation.",
  rerouted_shadow: "Rerouted to the central contract.",
  throttled: "Throttled per the response ladder.",
  alert_burn: "Burn pacing alert. No action required.",
  blocked: "Blocked, owner paged.",
  week_closed: "Week closed.",
};

// The factual half of a rationale: the event's numbers against the policy values,
// naming only the clauses that actually fired.
function detail(policy: Policy, event: Event, result: EvalResult): string {
  switch (event.type) {
    case "api_usage":
      return `${event.team} usage on an allowlisted provider, inside its monthly envelope.`;
    case "variance":
      return `Cost per request moved ${event.variancePct}% against the variance band.`;
    case "employee_card":
      return `Subscription ${event.teamSubscriptionCount} for ${event.team} against a ${policy.shadow_ai.team_subscription_threshold} subscription threshold.`;
    case "fine_tune":
      return `Fine-tune estimate ${event.estimatedUsd} against the ${policy.approvals.fine_tune_over_usd} approval line.`;
    case "agent_loop": {
      const parts = [`${event.retries} retries at ${event.usdPerHour} per hour`];
      if (result.firedClauses.includes("agents.max_retries_per_task")) {
        parts.push(`over the ${policy.agents.max_retries_per_task} retry limit`);
      }
      if (result.firedClauses.includes("agents.kill_threshold_usd_per_hour")) {
        parts.push(`over the ${policy.agents.kill_threshold_usd_per_hour} per-hour kill threshold`);
      }
      const burn =
        event.projectedOvernightUsd != null
          ? ` About ${event.projectedOvernightUsd} in overnight burn prevented.`
          : "";
      return `${parts.join(", ")}.${burn}`;
    }
    case "routing_exception":
      return `Frontier delta of ${event.deltaUsd} against a ${policy.routing.frontier_exception.max_delta_usd} cap.`;
    case "usage_spike":
      return `Usage at ${event.baselineMultiple}x baseline with no project tag.`;
    case "agent_card":
      return `Agent card charge of ${event.amountUsd} against a ${policy.agents.agent_card.single_txn_ceiling_usd} ceiling.`;
    case "subscription":
      return `Overlapping tool, about ${event.projectedSavingsUsdYear} per year saved if merged.`;
    case "new_provider":
      return `Unrecognized provider charged ${event.amountUsd}; the new-provider rule is set to ${policy.providers.new_provider_rule.action}.`;
    case "classification":
      return `Charge reclassified to ${policy.classification.default_class} under the tag rules.`;
    case "burn_pacing":
      return `Company spend at ${event.envelopePct}% of envelope against a ${policy.budgets.burn_alert_pct}% burn alert, ${event.daysRemaining} days left.`;
    case "week_close":
      return "Weekly rollup.";
  }
}

// Deterministic rationale built from the engine result and policy values: what the
// numbers were, then what the engine did. Only fired clauses are named, so it is
// always consistent with the verdict.
export function templateFromResult(
  policy: Policy,
  event: Event,
  result: EvalResult,
): string {
  return `${detail(policy, event, result)} ${VERDICT_LEDE[result.verdict]}`;
}
