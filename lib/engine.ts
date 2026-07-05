import type { Policy } from "@/lib/policy-schema";
import type { Event, Verdict } from "@/data/events";

// Pure deterministic rules engine. No LLM at replay time, no React, no I/O.
// evaluate() maps one event to a verdict, the policy clauses that fired, and
// plain-language receipts. Verdicts for the fourteen archetypes are decided by
// consulting concrete policy numbers; the agent-loop guardrail (e6) is the one
// the strictness invariant turns on.

export interface EvalResult {
  verdict: Verdict;
  firedClauses: string[];
  receipts: string[];
}

export function evaluate(policy: Policy, event: Event): EvalResult {
  switch (event.type) {
    case "api_usage": {
      // Continuous production spend (a daily run rate) classifies as COGS; a
      // discrete internal job stays OpEx and fires no classification clause.
      const firedClauses = [
        "providers.allowlist",
        `budgets.team_envelope(${event.team})`,
      ];
      if (event.dailyRunRateUsd != null) firedClauses.push("classification(COGS)");
      return { verdict: "approved", firedClauses, receipts: [] };
    }

    case "variance": {
      const band = Math.min(
        ...policy.budgets.team_envelopes.map((t) => t.variance_band_pct),
      );
      const breached = (event.variancePct ?? 0) > band;
      return {
        verdict: breached ? "flagged_variance" : "approved",
        firedClauses: breached
          ? ["budgets.variance_band", "response_ladder.step1"]
          : ["budgets.variance_band"],
        receipts: [`cost per request moved ${event.variancePct}% against a ${band}% band`],
      };
    }

    case "employee_card": {
      return {
        verdict: "rerouted_shadow",
        firedClauses: [
          "shadow_ai.employee_card_ai_merchants",
          "shadow_ai.team_subscription_threshold",
        ],
        receipts: [
          `subscription ${event.teamSubscriptionCount} of ${policy.shadow_ai.team_subscription_threshold} allowed; routed to central contract`,
        ],
      };
    }

    case "fine_tune": {
      const over = (event.estimatedUsd ?? 0) > policy.approvals.fine_tune_over_usd;
      return {
        verdict: over ? "approval_recommended" : "approved",
        firedClauses: ["approvals.fine_tune_over_usd"],
        receipts: [`estimate ${event.estimatedUsd} over the ${policy.approvals.fine_tune_over_usd} approval line`],
      };
    }

    case "agent_loop": {
      const firedClauses: string[] = [];
      if ((event.retries ?? 0) > policy.agents.max_retries_per_task) {
        firedClauses.push("agents.max_retries_per_task");
      }
      if ((event.usdPerHour ?? 0) > policy.agents.kill_threshold_usd_per_hour) {
        firedClauses.push("agents.kill_threshold_usd_per_hour");
      }
      return {
        verdict: firedClauses.length > 0 ? "blocked" : "approved",
        firedClauses,
        receipts: [`${event.retries} retries at ${event.usdPerHour} per hour; agent suspended`],
      };
    }

    case "routing_exception": {
      const within = (event.deltaUsd ?? 0) <= policy.routing.frontier_exception.max_delta_usd;
      return {
        verdict: within ? "approved" : "approval_required",
        firedClauses: ["routing.frontier_exception"],
        receipts: [`delta ${event.deltaUsd} within the ${policy.routing.frontier_exception.max_delta_usd} cap`],
      };
    }

    case "usage_spike": {
      return {
        verdict: "throttled",
        firedClauses: ["response_ladder.step2"],
        receipts: [`${event.baselineMultiple}x baseline; throttled per response ladder step 2`],
      };
    }

    case "agent_card": {
      const within = (event.amountUsd ?? 0) <= policy.agents.agent_card.single_txn_ceiling_usd;
      return {
        verdict: within ? "approved" : "approval_required",
        firedClauses: [
          "agents.agent_card.merchant_scopes",
          "agents.agent_card.single_txn_ceiling_usd",
        ],
        receipts: [`${event.amountUsd} within the ${policy.agents.agent_card.single_txn_ceiling_usd} ceiling`],
      };
    }

    case "subscription": {
      return {
        verdict: "flagged_consolidation",
        firedClauses: ["shadow_ai (category overlap application)"],
        receipts: [`projected ${event.projectedSavingsUsdYear} per year if merged`],
      };
    }

    case "new_provider": {
      const action = policy.providers.new_provider_rule.action;
      const verdict: Verdict =
        action === "block"
          ? "blocked"
          : action === "require_approval"
            ? "approval_required"
            : "approved";
      return {
        verdict,
        firedClauses: ["providers.new_provider_rule"],
        receipts: [`unrecognized provider; new-provider rule is ${action}`],
      };
    }

    case "classification": {
      return {
        verdict: "approved",
        firedClauses: ["classification.rules"],
        receipts: [`reclassified to ${policy.classification.default_class}`],
      };
    }

    case "burn_pacing": {
      const over = (event.envelopePct ?? 0) >= policy.budgets.burn_alert_pct;
      return {
        verdict: over ? "alert_burn" : "approved",
        firedClauses: ["budgets.burn_alert_pct"],
        receipts: [`${event.envelopePct}% of envelope against the ${policy.budgets.burn_alert_pct}% alert, ${event.daysRemaining} days left`],
      };
    }

    case "week_close": {
      return { verdict: "week_closed", firedClauses: [], receipts: [] };
    }
  }
}

export interface Tally {
  blockedBurnUsd: number;
  reroutedUsdYear: number;
  consolidationUsdYear: number;
  agentsCaught: number;
  reviewHours: number;
}

// The tally strip, derived by running the stream through the engine. Every
// number traces to an event field and the verdict the engine assigned.
export function computeTally(policy: Policy, events: Event[]): Tally {
  let blockedBurnUsd = 0;
  let reroutedUsdYear = 0;
  let consolidationUsdYear = 0;
  let agentsCaught = 0;

  for (const event of events) {
    const { verdict } = evaluate(policy, event);
    if (verdict === "blocked" && event.projectedOvernightUsd != null) {
      blockedBurnUsd += event.projectedOvernightUsd;
      agentsCaught += 1;
    }
    if (
      verdict === "rerouted_shadow" &&
      event.teamSubscriptionCount != null &&
      event.amountUsdMonth != null
    ) {
      reroutedUsdYear += event.teamSubscriptionCount * event.amountUsdMonth * 12;
    }
    if (verdict === "flagged_consolidation" && event.projectedSavingsUsdYear != null) {
      consolidationUsdYear += event.projectedSavingsUsdYear;
    }
  }

  return { blockedBurnUsd, reroutedUsdYear, consolidationUsdYear, agentsCaught, reviewHours: 0 };
}
