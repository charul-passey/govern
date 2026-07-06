# content/build-log.md
# LOCKED after Charul's final pass. Three days: July 3-5, 2026.

## Day 1 · July 3

At Stripe Sessions this year I watched Anthropic's monetization platform lead describe agents running thousands of tasks against cost envelopes they can query and tune. He said setting those limits manually won't be humanly possible. I kept thinking about the buyer's half of that sentence. Who writes the envelope? Who enforces it at 2am? That half didn't exist. Govern is my sketch of it.

## Day 1 · July 3

First commit had no code in it: a product spec, a policy generation prompt, a strategy memo, and a CLAUDE.md contract for the agent. I planned the build with Claude and executed it with Claude Code, the way I'd run a pod: the spec is the source of truth, the agent implements, the human reviews with taste. Deployed a blank skeleton to Vercel the same day. Always-shippable trunk from hour one.

## Day 1 · July 3

Claude Code rendered the hero and problem sections beautifully and rewrote half the words while doing it. My headline mutated. My best lines vanished into summary. One drifted footnote turned neutral framing into a jab at a company I admire. Root cause was mine: the final copy lived in a chat, and the spec in the repo held an older draft. Agents fill context gaps with improvisation. Fix: copy promoted to a locked content file with a render-verbatim rule. The words are closed; only the formatting is open.

## Day 1 · July 3

The Ramp AI Index publishes its underlying data as CSV, so I rebuilt on it. The adoption chart on this site is rendered from that data, not screenshotted. Better: the policy generator's envelope calibration is anchored to the published medians by sector, size, and financing. Every generated policy now carries a benchmark block naming the median it was calibrated against and the multiple it sits at. If a reader divides the numbers, the division holds. That rule shaped everything after it.

## Day 2 · July 4

For the enforcement engine I wrote the behavior first: fourteen events with expected verdicts and expected fired clauses, then let Claude Code implement until green. Writing the fixture caught my own arithmetic: my draft tally claimed $1,200 a year rerouted, and three subscriptions at $30 a month is $1,080. The engine ended at 100% line and branch coverage. It is deterministic on purpose. The LLM writes the policy; boring code decides the verdicts. The demo must never fail in front of the one person I built it for.

## Day 2 · July 4

The generation route validates LLM output against a schema, retries once with the errors appended, then falls back to the nearest pre-generated preset, then to a hand-written, fully tested floor policy. Four failure paths, all returning a usable policy. I broke the API key on purpose and watched the demo play the entire week without it. Claude Code flagged its own fixture change instead of slipping it past me, and explained an honest coverage gap instead of deleting guards to inflate the number. Trust, but verify. Then verify again.

## Day 2 · July 4

It looked immaculate. Then I divided. The summary claimed the envelope sat at 2.0x the sector median; the actual arithmetic said 4.4x. The right citation was attached to the wrong math. Two more finds in the same policy: an approval threshold that straddled a spec event, and a rationale whose savings figure contradicted the deterministic receipt on the same card. All three became validator code, not prompt pleading. The skill asks; the validator guarantees.

## Day 2 · July 4

Ten generations across deliberately awkward profiles. The validator earned its keep in one line: on a solo-agent profile the model stated 2.1x when the truth was 14.1x. The eval also surfaced a latent engine bug that every unit test had missed, because fixtures only confirm the behavior you expected to check. One preset shipped envelopes at 20.1x the benchmark before the clamp existed. Fixture tests confirm expected behavior. Evals discover unexpected behavior. You need both, and I now believe no AI feature should ship without the second.

## Day 3 · July 5

Live generation took 25 seconds. The fix wasn't a spinner. Preset companies now serve committed, validated policies instantly, and live generation runs in two phases: the policy renders in about ten seconds while the rationales generate behind your reading time. The strictness toggle switches between committed presets with a client-side diff, so the control a visitor plays with most costs nothing. The default path saves time. That's the whole religion of the company this project is written for.

## Day 3 · July 5

The spec called for a dual-pane layout, policy document beside raw JSON. Rendered, the JSON was eating half the page to prove a point a single line could carry. So the document went full width and the JSON became a tab, until the moment it earns its space: when the replay starts, the code opens as a rail, because that's when verdict receipts link to clauses. Question the requirement, then delete. Even when the requirement is yours.

## Day 3 · July 5

The simulator worked and I felt nothing. The block card told me $1,090 was prevented, but prevention is invisible. The fix was drawing the counterfactual: a burn line that steepens through Wednesday night while no card appears, then cuts flat when the policy blocks the runaway agent, with a dotted ghost showing where the money was headed. The gap between the ghost and the flat line is the product. A dashboard reports the fire. This chart shows the fire that didn't happen.

## Day 3 · July 5

Two mechanical rewrites the same day. Cards now prepend at the top of the feed so every animation stays on screen, moved with FLIP transforms instead of layout jumps. And the replay runs on a real simulation clock: Monday to Sunday mapped at constant speed, events firing when their timestamp arrives, so the intervals are uneven because the week was uneven. The quiet stretch before the midnight block isn't staged anticipation. It's Wednesday.

## Day 3 · July 5

Memo page, this log, and the instruments section, where the argument sharpens: a cap is not an instrument, it is a surrender. Budgets should be denominated in work, not tokens. Strictness never changes the size of a budget, only the controls around it. Every number on this site traces to a public source or a test assertion. That was the standard the whole way through, because the audience for this project is the kind of reader who divides.
