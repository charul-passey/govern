import type { Policy } from "@/lib/policy-schema";
import type { Event } from "@/data/events";

// Deterministic rationale templates: one plain sentence per event, written as the
// engine explaining its verdict against concrete policy numbers. Used to fill the
// floor policy, and available as the fallback when a generated rationale is
// missing. No dashes, plain language.
export function templateRationale(
  policy: Omit<Policy, "rationales">,
  event: Event,
): string {
  switch (event.type) {
    case "api_usage":
      return `${event.team} usage runs on an allowlisted provider and sits inside its monthly envelope. Approved.`;
    case "variance":
      return `Cost per request moved ${event.variancePct}% against the team variance band. Alerted at ladder step 1, not blocked.`;
    case "employee_card":
      return `Subscription ${event.teamSubscriptionCount} for ${event.team} passed the ${policy.shadow_ai.team_subscription_threshold} threshold. Rerouted to the central contract.`;
    case "fine_tune":
      return `Estimated ${event.estimatedUsd} clears the ${policy.approvals.fine_tune_over_usd} fine-tune line. Recommended for approval with checks passed.`;
    case "agent_loop":
      return `${event.retries} retries at ${event.usdPerHour} per hour breached the ${policy.agents.max_retries_per_task} retry limit. Agent blocked and owner paged.`;
    case "routing_exception":
      return `Frontier delta of ${event.deltaUsd} sits within the ${policy.routing.frontier_exception.max_delta_usd} cap. Approved for the exception window.`;
    case "usage_spike":
      return `Usage reached ${event.baselineMultiple}x baseline with no project tag. Throttled at ladder step 2, experimentation carve-out preserved.`;
    case "agent_card":
      return `Agent card charge of ${event.amountUsd} is within scope and under the ${policy.agents.agent_card.single_txn_ceiling_usd} ceiling. Approved.`;
    case "subscription":
      return `Overlapping tool found. Merging saves about ${event.projectedSavingsUsdYear} per year. Flagged for consolidation.`;
    case "new_provider":
      return `First charge from an unrecognized provider. The new-provider rule is set to ${policy.providers.new_provider_rule.action}. Approval required.`;
    case "classification":
      return `Charge reclassified to ${policy.classification.default_class} under the tag rules. Approved and noted for the controller.`;
    case "burn_pacing":
      return `Company spend at ${event.envelopePct}% of envelope against the ${policy.budgets.burn_alert_pct}% alert, ${event.daysRemaining} days left. Pacing alert only.`;
    case "week_close":
      return "Week closed. Every verdict above traces to a clause in the policy.";
  }
}
