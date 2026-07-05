# The governance gap
### Why the next chapter of AI spend management is policy, and why the window is now.

Charul Passey · July 2026 · 5 minute read

---

Everyone has a take on AI spending. Most takes share a flaw: they describe the spend and stop there. This memo is about what happens after you can see the number.

Start with what the data says. More than half of U.S. businesses now pay for AI services, 54.2% as of May, nearly double a year ago.¹ Average monthly token spend has grown 13x since January 2025.² Twelve-month retention on AI products reached 83.6%, up from 51% in 2022.³ This is no longer an experiment line. It is a permanent budget category, and the fastest-growing one on record.

Now look at how that category is managed. AI charges are leaking onto personal cards and returning as reimbursements, up 3x year over year.⁴ The spread between median and top-quartile spenders runs 4x to 15x depending on the vendor.⁴ The most sophisticated control publicly deployed at enterprise scale is a flat monthly cap per employee.⁵ Two-thirds of businesses using generative AI already run more than one tool, and in most of them nobody owns the category: finance, IT, and department heads each hold a piece.⁴

That is the governance gap. Adoption crossed the halfway mark. Management never left the starting line.

## Visibility ships first. Governance wins.

The market's first answer is visibility: pull token-level usage from providers, attribute it to teams and projects, classify it for the ledger. This is the right first product. It is buildable now, it answers the CFO's most urgent question, and it creates the data foundation everything else requires. The strongest version of it shipped this spring.⁶

It is also, on its own, a dashboard. Dashboards report the fire. Policy decides which fires cannot start.

The precedent here is instructive. Corporate cards were once visibility products too: a statement at month end, a reconciliation, an argument. The companies that now define the category won by moving control to the point of spend. The policy check happens before the swipe clears. Enforcement is where a finance product stops being a reporting layer and becomes infrastructure, because enforcement is where trust compounds. A company will switch dashboards in a quarter. It will not casually switch the system that decides, at midnight, whether a runaway agent keeps its budget.

Token spend has no equivalent of the declined swipe today. An API key does not check policy. A retry loop does not ask permission. The instruments that made card spend governable, preset limits, category rules, blocks at the point of transaction, have no analog for machine-initiated usage yet. Whoever builds those instruments first will have built the third pillar's control layer, and control layers are where switching costs live.

## Why an integrated platform wins this

Governance is a context problem before it is a software problem. A policy engine deciding whether a fine-tune job is in budget needs the contract terms, the team's envelope, the vendor's history, the accounting treatment, and the exception trail. That context lives in cards, bills, procurement records, and now token telemetry. A point tool sees one slice and guesses at the rest. A platform that already processes the invoices, issues the cards, and meters the usage can enforce policy with the full picture. Written policies are also the raw material AI enforcement agents consume; the platform that holds the policy holds the context that makes agents safe.⁷

The providers themselves are pulling in this direction. Model vendors are investing in spend visibility, predictability tooling, and programmatic budget controls, because in usage-based models, bill shock is a churn event. Their monetization teams describe a future of agents operating inside cost envelopes at a scale no human can administer by hand.⁹ A governance layer is not adversarial to the vendors. It is the demand-side counterpart of infrastructure they are already building, which is why they expose the telemetry that makes it possible.

There is a second advantage, quieter but durable: benchmarks. Spend benchmarks for AI already exist. The AI Index publishes median AI spend per employee by sector, size, and financing status, and the distribution it reveals is the whole story: the median company spends $11 per employee per month while the top decile's median is $611, a 54x gap.¹ Policy benchmarks are the missing layer: what rules companies actually set around that spend, what loose, normal, and strict look like at every size and sector. Travel policy benchmarks exist today for exactly this reason.⁸ AI spend policy benchmarks do not exist yet. The first publisher sets the defaults for an entire category, and defaults are strategy.

## Why the window is now

Consolidation has returned balance-sheet players to this market. A balance sheet is a real weapon: it can subsidize interchange, rewards, and customer acquisition for years. It cannot subsidize velocity. Integration is measured in quarters, and category definition in months. The governance layer for AI spend will be defined during someone's integration window. That is not a coincidence to exploit. It is a clock to respect.

## What I would ship in the first 90 days

**1. Policy as a generated artifact.** Every token-spend customer gets a draft AI spend policy inferred from their observed usage, presented in two forms: readable by a controller, executable by an engine. Humans approve; the system learns from their edits.

**2. Three enforcement primitives, reversible first.** Variance bands on unit cost, a graduated response ladder from alert to throttle to block, and agent guardrails on retries and burn rate. Blocks only where the action is recoverable. Proportionality is what earns the right to enforce.

**3. Published benchmarks.** Loose, normal, and strict AI spend policies by company size and sector, from anonymized data, released publicly. It trains the market, seeds demand, and defines the category in the publisher's terms.

The demo on this site is a working sketch of all three.

The pattern in this industry has repeated for forty years: a new spend category appears, grows faster than the systems around it, and the company that builds its control layer owns it for a generation. Payroll had one. Vendors had one. Intelligence is about to.

---

**Sources**
1. Ramp AI Index, ramp.com/data, May 2026.
2. Ramp Economics Lab, Business Spending Report, Spring 2026.
3. Ramp Economics Lab, Business Spending Report, Winter 2026.
4. Ramp, How to Buy AI: 5 Tips for Every Finance Leader, 2026.
5. TechCrunch, June 2026, reporting an enterprise per-employee AI budget cap.
6. Ramp, Token Spend Management announcement, April 2026.
7. Ramp, Autonomous Finance: FinOps for the AI Era, 2026.
8. Ramp Economics Lab, travel policy benchmarks, Business Spending Report, Spring 2026.
9. Stripe Sessions 2026, "Pricing as a Product," Stripe Billing leadership in conversation with Anthropic's monetization platform lead.

*This memo is part of Govern, an independent concept project. It is not affiliated with or endorsed by Ramp. All data is drawn from the cited public sources.*
