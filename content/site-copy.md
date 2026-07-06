# site-copy.md — LOCKED COPY, RENDER VERBATIM
# Every string below is final. Do not paraphrase, compress, restyle, or reorder.
# Only formatting decisions (type scale, spacing) are open. Words are closed.

## HERO

H1:
Every company just hired a third workforce. Nobody's managing its budget.

Subhead:
AI is the fastest-growing, most under-managed spend category in business. It's initiated by software, billed by the token, and invisible to every control built for people and vendors. Seeing it was chapter one.

Govern is a working concept for chapter two: policy, budget instruments, and enforcement for intelligence.

Primary CTA: Generate a policy →
Secondary link: Read the memo
Build line (monospace): built in {N} days · one PM · working demo below

## PROBLEM SECTION

Stat cards (number, then caption, footnote marker as small superscript):

13×
growth in average monthly AI token spend since January 2025 [1]

54.2%
share of U.S. businesses now paying for AI services [2]

3×
year-over-year growth in AI charges surfacing as employee reimbursements [3]

54×
gap between the median company and the top decile in monthly AI spend per employee [3]

Body (five paragraphs, verbatim):

Every system a company uses to control spending makes the same three assumptions: a human decides to spend, at human speed, at a price agreed in advance. Payroll works this way. Vendor contracts work this way. The corporate card works this way, too. Swipe, policy check, approval.

Token billing breaks all three assumptions at once. Spend is initiated by software, at machine speed, at prices that float with usage. A prompt-template change can triple a bill overnight. An agent stuck in a retry loop can burn a quarter's budget before Monday standup. And on the invoice, a junior engineer's Friday-night experiment looks identical to production inference.

Finance teams know it. AI charges are leaking onto personal cards and coming back as reimbursements, up 3× in a year.[3] The most sophisticated control publicly deployed at scale is a flat monthly cap per employee.[4] That is a seat-era instrument aimed at a usage-era problem. A cap rations spend, punishes the teams whose AI use is actually working, and governs nothing.

The market's answer so far is visibility: dashboards that show where the tokens went. Visibility is necessary. It is also where every product on the market stops. A dashboard reports the fire. Policy decides which fires can't start. For people and for vendors, that policy layer took decades to build. For intelligence, it doesn't exist yet.

What would it look like if it did? Generate one and find out. ↓

Chart (renders between stat cards and body, from data/ai-index.ts):
Line chart, Jan 2023 to May 2026. Ink line: Ramp AI Index, ends 54.2%. Dashed gray line: U.S. Census BTOS estimate, ends 20.1%. Labels at line ends, monospace. No legend box, no gridlines heavier than 1px. Title (small caps or small semibold): Share of U.S. businesses paying for AI. Source line under chart: Ramp AI Index, ramp.com/data, May 2026.

Footnotes (small type, section bottom):
1. Ramp Economics Lab, Business Spending Report, Spring 2026.
2. Ramp AI Index, ramp.com/data, May 2026.
3. Ramp AI Index dataset, May 2026: median monthly AI spend per employee $11.38; top-decile median $610.61.
4. Reported enterprise per-employee AI budget cap. TechCrunch, June 2026.

Superscript note: footnote markers render at caption text size, vertically raised. They should read like citation marks, never like exponents.

## INSTRUMENTS SECTION (LOCKED — render verbatim)

Section label: INSTRUMENTS
Header: Budgets for spend that thinks

Body (three paragraphs):

A cap is not an instrument. It is a surrender: one number, set once, blind to whether the spend it blocks was waste or the best money the company spent that month. Volatile, machine-initiated spend needs instruments the way portfolios need them: tools that price variance instead of forbidding it.

Govern's policies carry three. Variance bands hold each team to a tolerance around its envelope, so a 96% overnight jump in unit cost gets caught while a growing team's healthy ramp does not. Response ladders make enforcement proportional: alert, then throttle, then block, each step reversible until the last. And routing economics make the default cheap: efficient models by default, frontier models by exception, because the spread between tiers is the single largest lever in any AI budget.

One number these policies never use: cost per token. Unit costs only mean something operational. Cost per resolved ticket. Cost per merged PR. Cost per qualified lead. A budget denominated in work can be governed; a budget denominated in tokens can only be watched. Strictness, in this scheme, never changes the size of a budget. It changes the controls around it.

Calculator title: Routing economics
Calculator subtitle: The spread between model tiers is the lever. Drag it.
Calculator inputs: Monthly volume (Mtok) · Share routed to frontier (%) · Frontier price ($/Mtok, editable) · Efficient price ($/Mtok, editable)
Calculator defaults: 500 Mtok · 10% frontier · $15.00 · $0.80
Calculator outputs: monthly cost with routing vs all-frontier; annualized savings as the single yellow figure, labeled "saved per year by routing"
Calculator note (small type): Prices are illustrative and editable. The ratio is the point.

Closing beat: use the locked closing paragraph from GOVERN_SPEC.md §3 verbatim (the Stripe Sessions paragraph, ending "you cannot price what you cannot govern.").

## FOOTER (LOCKED — render verbatim)

Minimal and subtle. No about line. One quiet row:
Links: LinkedIn · GitHub · charulpassey.com
Disclaimer (small type, below links, unchanged): An independent concept project. Not affiliated with Ramp. Data cited from public sources only.
Note: /memo and /build-log remain reachable from the hero ("Read the memo") and body links; the resume, if included, lives on the person, not the product.

## DISCLAIMER (footer only, not floating mid-page)
An independent concept project. Not affiliated with Ramp. Data cited from public sources only.

## DEMO MICROCOPY (LOCKED — render verbatim)
Step 1 label: STEP 1 · PROFILE
Step 1 header: Pick a company
Step 1 subhead: Choose a preset or set your own. Each one generates a full policy calibrated to published industry benchmarks.
Preset badge (on preset-served policies): benchmark preset · regenerate live ↻
Step 2 label: STEP 2 · POLICY
Affordance line (under policy title, small type; line count computed from the rendered JSON, never hardcoded): also available as policy.json · {N} lines · schema-validated
Company envelope chip: {N}× sector median
Team envelope chip: {N}% of envelope
Fallback note: using cached policy
Live progress stages, in order: Pulling sector benchmarks · Calibrating envelopes · Writing enforcement clauses · Validating against the engine
Live generation expectation (small type beside or under the Customize generate button): generated and validated live · about 15 seconds
Step 3 label: STEP 3 · ENFORCEMENT
Burn chart ghost annotation (at e6 block, small type on dotted projection): +$1,090 by 06:00 without policy
Burn chart caption (small type, top left of chart): Cumulative AI spend · simulated week
Burn chart end label (monospace, at line terminus, value summed from event contributions, never hardcoded): week total ${N}
Step 3 button: Replay the week
Skip control: Skip to summary
New microcopy for any state not listed here must be proposed before rendering.
