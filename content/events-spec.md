# events-spec.md — LOCKED EVENT STREAM
# Source of truth for data/events.ts and the rules engine test fixture.
# Fourteen events, one simulated week, Series C preset, normal strictness.
# Amounts, timestamps, verdicts, and fired clauses are final. Do not invent events.
# Verdict enum: approved | approval_recommended | approval_required | flagged_variance
#   | flagged_consolidation | rerouted_shadow | throttled | alert_burn | blocked | week_closed

e1  Mon 09:14  api_usage      Production inference, support-triage service, Claude Sonnet, $211 daily run rate
    -> approved            clauses: providers.allowlist, budgets.team_envelope(Support), classification(COGS)

e2  Mon 11:02  api_usage      Nightly embeddings job, Data team, $38
    -> approved            clauses: providers.allowlist, budgets.team_envelope(Data)

e3  Tue 08:47  variance       Search team cost per request +96% overnight after deploy; volume unchanged
    -> flagged_variance    clauses: budgets.variance_band, response_ladder.step1
    rationale must name a plausible technical cause (prompt change doubled context length)
    receipts: burn projection breaches envelope in 11 days; owner notified

e4  Tue 14:30  employee_card  $30/mo ChatGPT Team subscription on Marketing employee card, third this quarter for the team
    -> rerouted_shadow     clauses: shadow_ai.employee_card_ai_merchants, shadow_ai.team_subscription_threshold
    receipts: routed to central OpenAI contract, seat available

e5  Wed 10:05  fine_tune      Fine-tune job request, ML Platform team, estimated $4,800
    -> approval_recommended  clauses: approvals.fine_tune_over_usd
    checklist (Ramp-style, all pass): within quarterly experimentation budget; dataset
    tagged and access-approved; classified OpEx; no equivalent recent job

e6  Wed 23:58  agent_loop     Autonomous research agent, Growth team, retry loop: 340 calls/hr, $47/hr, context growing each cycle
    -> blocked             clauses: agents.max_retries_per_task, agents.kill_threshold_usd_per_hour
    receipts: agent suspended, owner paged, $1,090 projected overnight burn prevented
    INVARIANT: blocked at every strictness. At loose, retries clause fires alone
    (hourly threshold does not); at normal/strict both fire.

e7  Thu 09:20  routing_exception  Growth team requests frontier-model exception for a demo build
    -> approved            clauses: routing.frontier_exception
    receipts: exception window 72h, delta cost $65 estimated. Approving tone.

e8  Fri 19:41  usage_spike    Junior engineer personal API key at 22x baseline, unattributed project tag
    -> throttled           clauses: response_ladder.step2
    receipts: alert fired 18:55 with no tag added; soft limit until Monday;
    experimentation carve-out preserved at $50

e9  Sat 10:12  agent_card     Procurement agent purchases $499 dataset license via its agent card
    -> approved            clauses: agents.agent_card.merchant_scopes, agents.agent_card.single_txn_ceiling_usd
    receipts: receipt auto-filed

e10 Sat 16:18  subscription   Design team trials AI video tool $89/mo; Sales already pays $1,400/yr for competing tool at 40% seat utilization
    -> flagged_consolidation  clauses: shadow_ai (category overlap application)
    receipts: projected $840/yr savings if merged

e11 Sun 09:30  new_provider   First charge from unrecognized inference provider, $120, Engineering
    -> approval_required   clauses: providers.new_provider_rule
    receipts: data-processing terms unreviewed; security questionnaire auto-sent. Neutral tone.

e12 Sun 11:44  classification Inference tagged to internal tool misclassified as COGS
    -> approved            clauses: classification.rules
    receipts: reclassified to OpEx; controller note appended. Dry tone.

e13 Sun 18:02  burn_pacing    Month-to-date AI spend at 87% of company envelope, 9 days remaining
    -> alert_burn          clauses: budgets.burn_alert_pct
    receipts: trajectory sparkline; no action required; CFO digest scheduled. No alarm.

e14 Sun 23:59  week_close     Weekly rollup
    -> week_closed         card dissolves into tally strip

TALLY STRIP (animated count-up; values are engine-derived, asserted in tests):
  $1,090 runaway burn blocked (e6)
  $1,200/yr rerouted to contracts (e4: 30 x 12 = 360; plus prior two subs this quarter
    already rerouted 2 x 30 x 12 = 720; display total 1,080 -> ROUND AND FIX AS $1,080/yr)
  $840/yr consolidation identified (e10)
  1 agent caught
  0 human review-hours spent
  Closing line (small type): Every verdict in this feed traces to a clause you can
  read in the policy JSON. That is the difference between a dashboard and a policy engine.

UI RULES:
- Events play at ~1.5s intervals; replay button afterward.
- Every card: verdict badge, one-line rationale, expandable receipts listing fired
  clause IDs. Clicking a clause ID scrolls/highlights that line in the JSON pane.
- e1/e2 quiet; the engine must feel restrained before it feels powerful.
- Quiet verdicts (approved) render at lower visual volume than catches.

ENGINE CONTRACT:
  evaluate(policy, event) -> { verdict, firedClauses: string[], receipts: string[] }
  Deterministic. No LLM at replay time. Rationale strings come from the generated
  policy's rationales map (e1..e14), validated against engine verdicts at generation
  time; on mismatch, fall back to a deterministic template for that event.
