# GOVERN — Product Spec & Build Plan
### A working concept for chapter two of AI spend management. Built by Charul Passey.

**Status:** Master spec. This file (plus DESIGN.md and CONTENT.md derived from it) is the primary context for all Claude Code sessions. Keep it updated as decisions change — the spec is the source of truth, not the chat history.

---

## 1. One-line pitch

> Seeing AI spend was chapter one. **Govern** is chapter two: policy, budget instruments, and enforcement for the fastest-growing, most under-managed spend category in business.

Positioning: an unaffiliated concept project that extends the publicly announced direction of Ramp's Token Spend Management (visibility → governance), built in Ramp's product language, on Ramp's published data, by a PM candidate demonstrating exactly the builder loop Ramp hires for.

**What this is NOT:** a pitch deck, a case study, a teardown, or a competitive analysis. It is a working product demo wrapped in a thin, sharp narrative.

---

## 2. Audience & success criteria

Primary audience: Ramp recruiters, PMs, CPO Geoff Charles, co-founders Eric Glyman & Karim Atiyeh. Secondary: anyone Charul networks with.

The site succeeds if:
1. A Ramp PM can reach the interactive demo within 15 seconds of landing and *do something* within 30.
2. The demo demonstrably "saves time or money" (their product bar) — the simulator ends with a concrete $ and hours counter.
3. The craft (design, copy, speed) is indistinguishable from a real Ramp product page. No consultant-speak anywhere.
4. The build log proves AI-native process (their PM interviews now require "show me a product you built and how").
5. Total read+play time for a curious exec: 6–10 minutes. Depth available for those who dig.

---

## 3. Site architecture (single page + two auxiliary routes)

Route: `govern.charulpassey.com` (Vercel). Single scrolling page, plus `/memo` and `/build-log`. PAGE ORDER (revised after fresh-eyes testing): Hero → Demo → The Gap (condensed argument) → Instruments → Footer. The demo sits directly under the hero; the argument follows the product.

### §0 Hero
- White field, near-black type, single yellow accent. Large statement:
  **"Every company just acquired a third payroll. Nobody's managing it."**
  Subhead: "AI is the fastest-growing, most under-managed spend category in business. Seeing it was chapter one. Govern is a working concept for chapter two — policy, budgets, and enforcement for intelligence bought by the token."
- Under CTA: small monospace line, homage to days.ramp.com: `built in N days · MMMM tokens · 1 PM` (live-computed from build metadata).
- CTA button (yellow): **"Generate a policy →"** — anchors to demo. Secondary link: "Read the memo".
- Tiny disclaimer line in footer of hero: "An independent concept project. Not affiliated with Ramp. Data cited from Ramp Economics Lab publications."

### §1 The problem (data wall, ~1 viewport)
Four stat cards + one real-data chart, every number cited; all copy verbatim from content/site-copy.md. Cards: 13× token spend growth; 54.2% adoption (AI Index, May 2026); 3× shadow-AI reimbursements; 54× median-to-top-decile gap in monthly AI spend per employee (AI Index dataset: $11.38 vs $610.61). Chart between cards and body: Ramp AI Index vs U.S. Census BTOS, Jan 2023–May 2026, rendered from data/ai-index.ts with a source line. Recreated from their downloadable CSV, never a screenshot of their chart.
Then the argument in 3 short paragraphs: seat-based budgeting assumes humans initiate spend at human speed; token billing is machine-initiated, volatile, and invisible to every control built for the first two pillars (people, vendors). The state of the art for control today is a flat per-employee cap — a seat-era instrument aimed at a usage-era problem. Visibility products (including Ramp's own, April 2026) solved *seeing*. Nobody has solved *governing*.

### §2 The product — Govern demo (the heart, ~60% of build effort)

Three-step interactive flow, all client-visible state, no login.

**Step 1 — Profile.** User picks a company preset (or customizes):
- Presets: "Seed startup, 15 ppl, AI-native" / "Series C SaaS, 300 ppl, scaling AI" / "Industrial mfg, 2,000 ppl, early AI"
- Custom dials: headcount band, sector, AI maturity (experimenting / scaling / dependent), risk posture (loose / normal / strict — direct homage to Ramp's travel-policy benchmark table).

**Step 2 — Policy generation.** Calls `/api/generate-policy` (Claude via Anthropic API). Returns a dual-pane artifact:
- **Left pane: human-readable policy** — reads like a page from Ramp's expense-policy ebook. Sections: Providers & models; Budgets & variance bands; Agent guardrails; Shadow-AI rules; Classification (COGS vs OpEx); Approvals; Anomaly response ladder.
- **Right pane: the same policy as machine-readable JSON** ("policy-as-code") — the point being *this* is what an enforcement agent actually consumes. Toggle loose/normal/strict re-generates with visible diffs.
- Design note: two-pane layout mirrors Ramp's bill-pay UI (document left, structured data right).
- **Benchmark chips:** each team envelope and the company envelope render a small context chip, e.g. "2.1× sector median", populated from budgets.benchmark in the policy JSON, values traceable to data/ai-index.ts (Ramp AI Index, May 2026). This is the visible thread from Ramp's public data into every generated policy.

Policy dimensions (the schema — see §5):
1. **Provider & model allowlist** with default-tier routing rule (cheap model by default, frontier by exception — echoes the 90/10 routing pattern Ramp has described publicly for its own stack).
2. **Budgets as variance bands, not caps**: per-team monthly envelope + tolerated variance % + burn-rate alert threshold. (The anti-Uber-cap argument embodied.)
3. **Agent guardrails**: max retries per task, max context growth per loop, per-agent-card transaction ceiling, kill-switch threshold ($/hr).
4. **Shadow-AI rules**: AI-category charges on employee cards auto-detected → route to central contract; personal-tier subscription reimbursements auto-flagged after N per team.
5. **Classification rules**: which usage maps to COGS vs OpEx (by project tag / environment).
6. **Approval thresholds**: new provider, new model tier, fine-tune jobs, contract > $X.
7. **Anomaly response ladder**: alert → throttle → block, with time windows and owners.

**Step 3 — Enforcement simulator.** "Replay a week" button. A pre-authored synthetic stream of ~14 AI-spend events plays through the generated policy at ~1.5s per event. Event types (each an archetype from Ramp's own published problem statements):
- Routine inference within band → **Approved · in policy** (quiet green)
- Prompt-template change doubles avg token count → **Flagged: variance breach** with reasoning receipt
- Agent stuck in retry loop, $47/hr burn → **Blocked: loop guardrail** (the money shot)
- New ChatGPT Team sub on an employee card → **Rerouted: shadow AI** → central contract suggestion
- Fine-tune job kickoff → **Approval recommended** with checks-passed list (mirrors Ramp's "Ready to approve" checklist UI)
- Friday-night experiment spike by junior eng → **Throttled** per response ladder
- Agent Card purchase at merchant within scope → **Approved** (shows agent-initiated commerce covered too)
- ...etc (full event list in `data/events.ts`)
Every decision card shows: verdict, one-line reason, expandable "receipts" (which policy clauses fired, with clause IDs linking back to the JSON pane). This reasoning-with-receipts pattern is Ramp's signature UI move — copy it faithfully.
- **End state:** tally strip — "This week: $X blocked, $Y rerouted to negotiated contracts, Z hours of review avoided, 1 runaway agent caught." Save time and money, made literal.
- Reliability: decisions are computed by a **deterministic TypeScript rules engine** evaluating the policy JSON (never breaks, instant). The natural-language rationale strings are LLM-generated *at policy-generation time* and cached with the policy. If the API is down, three fully pre-generated preset policies + rationales ship in the bundle → demo always works. Live generation is the delight; cached mode is the floor.

### §3 Budget instruments (the pricing-brain section, ~1 viewport)
Charul's spike on display. Short, dense, opinionated:
- Thesis: volatile machine-initiated spend needs *instruments*, not caps — variance bands, routing economics, unit-cost metrics (cost per resolved ticket, per merged PR, per booking — not cost per token).
- **One interactive widget: the Routing Economics Calculator.** Sliders: monthly requests, % routed to frontier model, prices per Mtok (editable, defaults from public price sheets). Output: monthly cost at all-frontier vs routed, annualized savings. One yellow number.
- Closing beat (final copy, no widget): "The other side of the market is already moving. Model providers are building budget APIs, programmatic limits, and real-time cost telemetry into their platforms, because unbounded spend produces unhappy buyers and churn. At Stripe Sessions this year, Anthropic's monetization platform lead described a near future where agents run thousands of tasks against cost envelopes they can query and tune, and called manual limit-setting impossible at that scale. The supply side is building the meter. The demand side, the policy engine that decides what the meter is allowed to record, is still unclaimed. Governing token costs and pricing agentic work are the same curve read from opposite ends. You cannot budget what you cannot meter, and you cannot price what you cannot govern."
- NOTE for build log + interviews: Charul attended this Stripe Sessions talk live. Origin-story beat to use verbatim: "I watched Anthropic's monetization lead say it won't be humanly possible to set agent budgets manually, and realized the buyer's half of that sentence didn't exist yet."

### §4 The memo (`/memo`, linked with excerpt on main page)
~900 words, Ramp Economics Lab voice (anti-pundit, data-cited, confident only where warranted). Argument arc:
1. Adoption crossed half; management didn't. The gap is the opportunity.
2. Visibility ships first because it's buildable; governance wins because it's where trust compounds. Policy enforcement is where a platform stops being a dashboard and starts being infrastructure.
3. Why the platform that owns cards + bills + procurement + token telemetry wins governance (context beats point tools — echoes "policies are critical context for AI agents").
4. Why *now*: consolidation has put balance-sheet players back in the market. Balance sheets can subsidize interchange and rewards; they cannot subsidize velocity. The window for the governance land-grab is the integration window. (Implicit. No company named beyond, at most, one factual clause. The reader who knows, knows.)
5. What I'd ship in the first 90 days (3 crisp bullets tied to the demo above).
Signed, dated, with sources list. Print stylesheet → exports clean as PDF.

### §5 Build log (`/build-log`)
Honest, technical, day-by-day. For each session: goal, what Claude Code did, what broke, what I decided as the human in the loop, tokens/time spent. Include 2–3 verbatim prompt excerpts and one wrong turn with the fix. Closing line: total elapsed days (matches hero counter). This section is the interview.

### §6 Footer
About Charul (2 lines + photo optional), links: resume PDF, LinkedIn, charulpassey.com, email. Full disclaimer + citations list. No Ramp logo anywhere; the word "Ramp" appears only in factual citation context.

---

## 4. Design system (DESIGN.md summary)

- **Palette:** `#FFFFFF` ground, `#1A1A1A` ink, Ramp-adjacent yellow `#E4F222` (accent ONLY: primary CTA, one stat highlight, tally strip), functional green/red at low saturation for verdicts, warm gray `#F5F4F1` for panels.
- **Type:** Inter (tight tracking, heavy weights for display; near-Ramp without cloning their custom face). Monospace (JetBrains Mono) for JSON pane, counters, clause IDs.
- **Layout:** generous white space, 720px prose measure, 1120px max shell. Restraint everywhere; the yellow must feel scarce.
- **Motion:** simulator events slide-fade in at 150ms; nothing else moves. No parallax, no gradients, no glassmorphism.
- **Quality bar:** Lighthouse ≥ 95 across the board; sub-1s LCP on 4G; flawless at 375px width.

---

## 5. Technical architecture

- **Stack:** Next.js 14 (App Router, TypeScript), Tailwind, deployed on Vercel. Repo: `govern`.
- **Policy schema:** `lib/policy-schema.ts` — single Zod schema, source of truth for generator output, JSON pane rendering, and rules engine input. (Zod → validate LLM output; reject-and-retry once on schema failure, then fall back to nearest preset.)
- **`/api/generate-policy`:** Vercel serverless route → Anthropic Messages API (`claude-sonnet-4-6`). System prompt lives in `prompts/policy-skill.md` — written like a Ramp "skill": role, schema, calibration tables for loose/normal/strict by company size/sector, 2 few-shot examples, hard rule: JSON only. Also returns per-event rationale strings for the fixed event stream (single call, structured output).
- **Rules engine:** `lib/engine.ts` — pure function `(policy, event) → verdict + firedClauses[]`. 100% unit-tested (this is the TDD teaching session).
- **Event stream:** `data/events.ts` — authored, not generated; ~14 events with realistic merchants/models/amounts. Synthetic but plausible; no real company data.
- **AI Index data:** `data/ai-index.ts` — generated extract of the Ramp AI Index public dataset (May 2026): headline adoption series (Ramp vs Census), benchmark constants (spend per employee by sector/size/financing, percentile spreads, provider adoption, spend mix). Powers the §1 chart, the benchmark chips in generated policies, and the policy skill's envelope calibration. Never hand-edited; regenerate from the CSV bundle.
- **Caching/fallback:** 3 preset policies + rationales pre-generated at build time into `data/presets/`. Client uses live API when available; silent fallback otherwise. Rate-limit the route (IP-based, generous) to keep her API bill at pennies.
- **Analytics:** Vercel Analytics + a few custom events (policy generated, simulator completed, memo opened, build-log opened) — so Charul can see whether Ramp visitors reach the payoff.
- **OG/meta:** custom OG image (hero statement on white with yellow bar) — the link preview a recruiter forwards IS the first impression.
- **Env:** `ANTHROPIC_API_KEY` in Vercel env vars only. Never in repo.

---

## 6. Build plan — Claude Code sessions

Philosophy: mirror Ramp's loop. Each session = (1) update spec → (2) let Claude Code execute → (3) human review with taste → (4) log it. Charul drives; each session has an explicit learning objective.

**Session 0 — Context engineering (0.5 day)**
Create repo, `CLAUDE.md` (distilled from this spec: stack, conventions, design tokens, "never do" list), commit `GOVERN_SPEC.md`, `DESIGN.md`, `prompts/policy-skill.md` stub.
*Learn:* how much steering power lives in context files vs prompts.

**Session 1 — Skeleton & design system (1 day)**
Scaffold Next.js + Tailwind, design tokens, layout shell, Hero + Problem sections with final copy. Deploy to Vercel from day one (always-shippable trunk).
*Learn:* iterating on visual design with Claude Code via screenshots; the deploy-early habit.

**Session 2 — Schema & rules engine, test-first (1–1.5 days)**
Write Zod policy schema; author `events.ts`; have Claude Code write engine tests FIRST from the spec's verdict table, then implement until green.
*Learn:* TDD with an agent — specifying behavior instead of code.

**Session 3 — The policy skill & API route (1–1.5 days)**
Author `policy-skill.md` (drafted in chat; envelope calibration is benchmark-anchored to data/ai-index.ts values), build the route, structured-output validation, retry/fallback logic, generate the 3 presets, wire loose/normal/strict calibration. Eval check: every generated policy's budgets.benchmark values must match the constants in data/ai-index.ts.
*Learn:* prompt/skill engineering for reliable structured JSON; eval-by-hand: generate 10 policies, grade them, tighten the skill.

**Session 4 — Demo UI (2 days)**
Profile step, dual-pane policy artifact (diff on strictness toggle), simulator with verdict cards, receipts expanders, clause-ID cross-linking, tally strip.
*Learn:* component iteration speed; when to hand Claude a reference screenshot (Ramp's approve/reject cards) vs describe in words.

**Session 5 — Instruments + memo + build log (1–1.5 days)**
Routing calculator widget; `/memo` route with print stylesheet; `/build-log` from the running log; footnote/citation system.
*Learn:* content-as-data (MDX), and how craft in copy is enforced the same way as craft in code.

**Session 6 — Polish & hardening (1–1.5 days)**
Responsive pass at 375px, OG image, analytics events, rate limiting, error states, cached-mode test (kill the API key locally and verify grace), Lighthouse to ≥95, cross-browser.
*Learn:* the last 10% that separates portfolio-grade from product-grade.

**Session 7 — Ship & dogfood (0.5 day)**
Domain `govern.charulpassey.com`, fresh-eyes run-through on phone, send to 2 trusted friends with a stopwatch ("where did you stop scrolling?"), fix the top 3 findings, freeze the day counter, write final build-log entry.

Realistic total: **8–10 focused days.** The hero counter tells the truth, whatever it ends up being.

---

## 7. What we draft in chat (before/parallel to sessions)

1. **All site copy** — hero, problem section, demo microcopy, section intros. (Voice: Ramp product page × Economics Lab.)
2. **The memo** — full draft, then compress by 30%.
3. **`policy-skill.md`** — the generation prompt, with calibration tables.
4. **The event stream** — all 14 events with amounts, merchants, expected verdicts (this doubles as the engine's test fixture).
5. **Build-log entries** — Charul writes raw notes after each session; we edit for voice.

## 8. Risk register
- **They ship "governance" mid-build** → fine: reframe one hero line ("here's how I'd think about it") — the demo's value is the thinking + craft, not the scoop. Monitor ramp.com/product-releases weekly.
- **Trademark/tone** → no logo, no "Ramp Govern", disclaimer present, all data cited. The project reads as tribute-through-extension, not impersonation.
- **API cost/abuse** → rate limit + cached fallback; expected spend < $10 total.
- **Overbuild** → the memo and instruments sections are fixed-scope; only the demo is allowed to absorb extra days.
