# CLAUDE.md — govern

## What this is
Govern is a single-page concept product: an AI spend policy generator and enforcement
simulator, wrapped in a short narrative site. It is a job-application work project built
to product quality. GOVERN_SPEC.md is the source of truth. When the spec and an
instruction conflict, stop and ask. Never invent scope beyond the spec.

## Stack
- Next.js 14, App Router, TypeScript strict mode
- Tailwind CSS, tokens defined in tailwind.config.ts only (no arbitrary values in JSX)
- Deployed on Vercel; ANTHROPIC_API_KEY lives in Vercel env vars only, never in the repo
- No new dependencies without asking first. Prefer zero-dependency solutions.

## Commands
- `npm run dev` — local dev
- `npm run build` — must pass with zero type errors before any commit is proposed
- `npm run test` — Vitest; the rules engine must stay at 100% line coverage
- `npm run lint` — must be clean

## File map
- `app/` — routes: `/` (main page), `/memo`, `/build-log`, `api/generate-policy`
- `components/` — one file per section: Hero, Problem, Demo, Instruments, Footer
- `lib/policy-schema.ts` — Zod schema, single source of truth for the policy shape
- `lib/engine.ts` — pure deterministic rules engine: (policy, event) -> verdict + firedClauses
- `data/events.ts` — the fixed 14-event stream and expected-verdict test fixture
- `data/presets/` — pre-generated fallback policies; never edit by hand
- `data/ai-index.ts` — Ramp AI Index public dataset extract; generated, never edit by hand; every rendered number from it gets a citation
- `prompts/policy-skill.md` — the generation prompt; NEVER modify without explicit instruction
- `content/site-copy.md` — the only source for site copy; render verbatim, NEVER modify
- `content/memo.md` — memo prose; NEVER modify without explicit instruction
- `LOG.md` — build log; append-only, human-written; do not edit

## Design tokens
- Ground `#FFFFFF`, ink `#1A1A1A`, accent yellow `#E4F222`, panel gray `#F5F4F1`
- Verdict colors: approved green `#1E7F4F`, caution amber `#B98900`, blocked red `#C13515`,
  all used at low visual volume (borders, badges), never as large fills
- Yellow is scarce: primary CTA, one stat highlight, the tally strip. Nothing else.
- Type: Inter for UI and prose (tight tracking, weights 500-800 for display);
  JetBrains Mono for JSON, clause IDs, counters
- Layout: 1120px max shell, 720px prose measure, generous whitespace
- Motion: simulator cards slide-fade in at 150ms. Nothing else animates. No parallax,
  no gradients, no glassmorphism, no shadows heavier than sm.

## Voice rules (apply to ALL copy, including microcopy, button labels, error states,
## empty states, and code comments that may render)
- No em dashes or en dashes in prose. Use periods, colons, or commas.
  Numeric ranges may use an en dash.
- No "not X, but Y" constructions. State the affirmative.
- No "isn't just", "more than just", "it's about".
- No hedging adverbs: truly, deeply, incredibly, seamlessly, effortlessly.
- No rhetorical triads unless every item is concrete.
- Short sentences. Facts carry the tone.
- All site copy comes from GOVERN_SPEC.md or content/. If copy is missing for a state
  (error, loading, empty), propose it in the plan and wait for approval.

## Engineering rules
- The rules engine is deterministic and fully unit-tested. The LLM never decides verdicts.
- LLM output is validated against lib/policy-schema.ts with Zod. On failure: retry once,
  then fall back to the nearest preset in data/presets/. The demo must work with the
  API key removed; test this state.
- The API route is rate-limited by IP. Fail soft, never surface a raw error to the UI.
- Accessibility: semantic HTML, visible focus states, prefers-reduced-motion respected,
  all interactive elements keyboard-reachable.
- Performance budget: Lighthouse >= 95 on all categories, LCP < 1s on fast 4G.
  No image or font over 100KB. Static-render everything except the API route.
- Mobile first: every component must be checked at 375px width.

## Workflow expectations
- Before writing code in any session: state a short plan (files to touch, approach)
  and wait for approval.
- Small diffs. One concern per commit. Propose commit messages in imperative mood.
- After each change: run build, lint, and tests, and report results honestly,
  including anything skipped.
- If something in the spec seems wrong or ambiguous, say so and ask. Do not silently
  reinterpret.

## Never do
- Never add analytics, tracking, or third-party scripts beyond Vercel Analytics.
- Never use localStorage or sessionStorage.
- Never commit secrets, .env files, or generated presets containing errors.
- Never edit prompts/, content/, or LOG.md unless explicitly instructed.
- Never use the word "Ramp" in UI copy. It may appear only in the footnotes/citations
  and disclaimer components, sourced from content/.
- Never ship placeholder copy ("lorem", "TODO", "coming soon") to the deployed site.
