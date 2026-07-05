import { evaluate } from "@/lib/engine";
import { events, type Verdict } from "@/data/events";
import { templateFromResult } from "@/lib/rationales";
import type { Policy } from "@/lib/policy-schema";

export interface RationaleReplacement {
  eventId: string;
  reason: "verdict_mismatch" | "clause_reference";
  engineVerdict: Verdict;
  expectedVerdict: Verdict;
  firedClauses: string[];
}

export interface ValidatedPolicy {
  policy: Policy;
  report: RationaleReplacement[];
}

// Distinctive phrases that signal a rationale is leaning on a specific clause. A
// rationale that uses one whose clause did not fire is inconsistent with the
// engine and gets templated.
const CLAUSE_KEYWORDS: { keyword: string; clausePrefix: string }[] = [
  { keyword: "kill threshold", clausePrefix: "agents.kill_threshold_usd_per_hour" },
  { keyword: "retry limit", clausePrefix: "agents.max_retries_per_task" },
  { keyword: "variance band", clausePrefix: "budgets.variance_band" },
  { keyword: "frontier", clausePrefix: "routing.frontier_exception" },
  { keyword: "fine-tune", clausePrefix: "approvals.fine_tune_over_usd" },
  { keyword: "subscription threshold", clausePrefix: "shadow_ai.team_subscription_threshold" },
  { keyword: "ceiling", clausePrefix: "agents.agent_card.single_txn_ceiling_usd" },
  { keyword: "new-provider", clausePrefix: "providers.new_provider_rule" },
  { keyword: "burn alert", clausePrefix: "budgets.burn_alert_pct" },
  { keyword: "consolidation", clausePrefix: "shadow_ai (category overlap application)" },
  { keyword: "reclassif", clausePrefix: "classification" },
  { keyword: "allowlist", clausePrefix: "providers.allowlist" },
];

function namesUnfiredClause(rationale: string, firedClauses: string[]): boolean {
  const lower = rationale.toLowerCase();
  return CLAUSE_KEYWORDS.some(
    ({ keyword, clausePrefix }) =>
      lower.includes(keyword) &&
      !firedClauses.some((c) => c.startsWith(clausePrefix)),
  );
}

// Runs the engine over the fixed event stream against the given policy. Any
// rationale whose verdict class disagrees with the engine, or that names a clause
// the engine did not fire, is replaced by a deterministic template. Returns the
// corrected policy and a report of every replacement.
export function validateRationales(policy: Policy): ValidatedPolicy {
  const rationales = { ...policy.rationales };
  const report: RationaleReplacement[] = [];

  for (const event of events) {
    const result = evaluate(policy, event);
    const id = event.id as keyof Policy["rationales"];
    const verdictMismatch = result.verdict !== event.expectedVerdict;
    const clauseMismatch = namesUnfiredClause(rationales[id] ?? "", result.firedClauses);

    if (verdictMismatch || clauseMismatch) {
      rationales[id] = templateFromResult(policy, event, result);
      report.push({
        eventId: event.id,
        reason: verdictMismatch ? "verdict_mismatch" : "clause_reference",
        engineVerdict: result.verdict,
        expectedVerdict: event.expectedVerdict,
        firedClauses: result.firedClauses,
      });
    }
  }

  return { policy: { ...policy, rationales }, report };
}
