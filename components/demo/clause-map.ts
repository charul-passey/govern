// Maps an engine-fired clause ID to the JSON key path it should scroll to in the
// policy.json view. Exact clause IDs are already key paths; parameterized or
// semantic ones resolve to the nearest key.
export function clauseToPath(clause: string): string {
  if (clause.startsWith("budgets.team_envelope(")) return "budgets.team_envelopes";
  if (clause === "budgets.variance_band") return "budgets.team_envelopes";
  if (clause.startsWith("classification(")) return "classification.rules";
  if (clause.startsWith("response_ladder.step")) return "response_ladder";
  if (clause.startsWith("shadow_ai (")) return "shadow_ai";
  return clause;
}
