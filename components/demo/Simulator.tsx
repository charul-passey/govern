"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import type { Policy, PolicyCore, Rationales } from "@/lib/policy-schema";
import { evaluate, computeTally } from "@/lib/engine";
import { events } from "@/data/events";
import { VerdictCard } from "@/components/demo/VerdictCard";
import { TallyStrip } from "@/components/demo/TallyStrip";
import { PolicyJson } from "@/components/demo/PolicyJson";
import { BurnTimeline } from "@/components/demo/BurnTimeline";
import { buildBurnModel, X_END } from "@/components/demo/burn-model";
import { clauseToPath } from "@/components/demo/clause-map";

type SimPolicy = PolicyCore & { rationales?: Rationales };

const NONE = new Set<string>();
const CARD_EVENTS = events.slice(0, 13); // e1..e13; e14 (week close) becomes the tally
const REPLAY_MS = 22000; // one replay: Monday 00:00 through Sunday 23:59
const TALLY_PAUSE_MS = 500; // brief beat before the tally prepends

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function Simulator({ policy }: { policy: SimPolicy }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const [revealed, setRevealed] = useState(0);
  const [showTally, setShowTally] = useState(false);
  const [instant, setInstant] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const p = policy as unknown as Policy;
    return CARD_EVENTS.map((event) => ({ event, result: evaluate(p, event) }));
  }, [policy]);
  const tally = useMemo(() => computeTally(policy as unknown as Policy, events), [policy]);
  const model = useMemo(() => buildBurnModel(results), [results]);
  const weekTotal = useMemo(
    () => events.reduce((sum, e) => sum + (e.spendContributionUsd ?? 0), 0),
    [],
  );

  // FLIP: cards render newest-first in final order; existing cards slide down from
  // their prior position via transform so a prepend never jumps the layout. Reading
  // positions just before each reveal keeps expanded receipts' heights intact.
  const flipRef = useRef<HTMLDivElement>(null);
  const firstTops = useRef<Map<string, number>>(new Map());
  const doFlip = useRef(false);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const captureFirst = useCallback(() => {
    const c = flipRef.current;
    if (!c || reducedRef.current) return;
    const m = new Map<string, number>();
    c.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((el) => {
      m.set(el.dataset.flipId ?? "", el.getBoundingClientRect().top);
    });
    firstTops.current = m;
    doFlip.current = true;
  }, []);

  useLayoutEffect(() => {
    const c = flipRef.current;
    if (!c || !doFlip.current) return;
    doFlip.current = false;
    const first = firstTops.current;
    c.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((el) => {
      const prev = first.get(el.dataset.flipId ?? "");
      if (prev === undefined) return; // new element: uses the CSS entry animation
      const delta = prev - el.getBoundingClientRect().top;
      if (!delta) return;
      el.style.transition = "none";
      el.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 150ms ease-out";
        el.style.transform = "";
      });
    });
  }, [revealed, showTally]);

  // Reset when the policy substance changes.
  const signature = `${policy.meta.strictness}:${policy.meta.company_name}:${policy.budgets.company_envelope_usd_month}`;
  useEffect(() => {
    setPhase("idle");
    setRevealed(0);
    setShowTally(false);
    setInstant(false);
    setPreparing(false);
  }, [signature]);

  function begin() {
    setInstant(false);
    setShowTally(false);
    setRevealed(0);
    setPhase("playing");
    track("replay_started");
  }

  // Auto-start once rationales arrive after a preparing click.
  useEffect(() => {
    if (preparing && policy.rationales) {
      setPreparing(false);
      begin();
    }
  }, [preparing, policy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reduced motion: render the final state instantly.
  useEffect(() => {
    if (phase === "playing" && reduced) {
      setInstant(true);
      setRevealed(results.length);
      setShowTally(true);
      setPhase("done");
      track("replay_completed");
    }
  }, [phase, reduced, results.length]);

  // Card reveals are driven by the clock: each event fires as it is crossed.
  const handleCross = useCallback(
    (index: number) => {
      captureFirst();
      setRevealed(index + 1);
    },
    [captureFirst],
  );
  const handleComplete = useCallback(() => {
    setPhase("done");
    track("replay_completed");
  }, []);

  // After the last card, a brief pause, then the tally prepends and the stack flips down.
  useEffect(() => {
    if (phase !== "done" || showTally || instant) return;
    const t = setTimeout(() => {
      captureFirst();
      setShowTally(true);
    }, TALLY_PAUSE_MS);
    return () => clearTimeout(t);
  }, [phase, showTally, instant, captureFirst]);

  function start() {
    if (!policy.rationales) {
      setPreparing(true);
      return;
    }
    begin();
  }

  function skip() {
    setInstant(true);
    setRevealed(results.length);
    setShowTally(true);
    setPhase("done");
  }

  function handleClause(clause: string) {
    track("clause_clicked");
    const rail = railRef.current;
    if (!rail) return;
    const el = rail.querySelector<HTMLElement>(`[data-json-path="${clauseToPath(clause)}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    el.classList.remove("animate-value-flash");
    void el.offsetWidth; // reflow so the flash replays
    el.classList.add("animate-value-flash");
  }

  const shown = results.slice(0, revealed);

  return (
    <div className="mt-16 border-t border-ink/10 pt-10">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">STEP 3 · ENFORCEMENT</p>

      {phase === "idle" && (
        <button
          type="button"
          onClick={start}
          disabled={preparing}
          className="mt-4 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-ground focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:opacity-50"
        >
          {preparing ? "Preparing…" : "Replay the week"}
        </button>
      )}

      {phase !== "idle" && (
        <>
          <div className="sticky top-0 z-10 -mx-6 mt-4 flex flex-wrap items-center gap-4 bg-panel px-6 py-2">
            {phase === "playing" ? (
              <button
                type="button"
                onClick={skip}
                className="rounded-md border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                Skip to summary
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                className="rounded-md bg-ink px-5 py-2 text-sm font-semibold text-ground focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
              >
                Replay the week
              </button>
            )}
            <a
              href="#sim-json"
              className="rounded-sm text-sm text-ink/50 underline-offset-4 hover:text-ink hover:underline lg:hidden"
            >
              View policy.json ↓
            </a>
          </div>

          <BurnTimeline
            vertices={model.vertices}
            dots={model.dots}
            ghost={model.ghost}
            maxY={model.maxY}
            total={weekTotal}
            xEnd={X_END}
            replayMs={REPLAY_MS}
            playing={phase === "playing" && !instant && !reduced}
            instant={instant}
            reduced={reduced}
            onCross={handleCross}
            onComplete={handleComplete}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div
              ref={flipRef}
              className="min-w-0 space-y-3 lg:col-span-3"
              style={{ overflowAnchor: "none" }}
            >
              {showTally && (
                <div data-flip-id="tally">
                  <TallyStrip tally={tally} reduced={reduced} animate={!instant} />
                </div>
              )}
              {shown
                .slice()
                .reverse()
                .map(({ event, result }) => (
                  <div key={event.id} data-flip-id={event.id}>
                    <VerdictCard
                      event={event}
                      verdict={result.verdict}
                      firedClauses={result.firedClauses}
                      rationale={policy.rationales?.[event.id as keyof Rationales] ?? ""}
                      onClause={handleClause}
                      animate={!instant}
                    />
                  </div>
                ))}
            </div>
            <div
              id="sim-json"
              ref={railRef}
              className="min-w-0 rounded-md border border-ink/10 bg-ground p-4 lg:sticky lg:top-16 lg:col-span-2 lg:max-h-screen lg:overflow-auto"
            >
              <PolicyJson policy={policy} changed={NONE} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
