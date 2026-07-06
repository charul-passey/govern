"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { n: 1, name: "PROFILE", id: "step-1" },
  { n: 2, name: "POLICY", id: "step-2" },
  { n: 3, name: "ENFORCEMENT", id: "step-3" },
];

// Horizontal step rail, rendered inline above Step 1. It sticks beneath the top nav
// while the demo is in view and releases after Step 3. Steps without content yet are
// muted and non-interactive; the current step highlights by scroll position; existing
// steps click-to-jump. Mobile drops the "STEP " prefix. Ink and gray only.
export function StepRail({ hasPolicy }: { hasPolicy: boolean }) {
  const [active, setActive] = useState("step-1");

  // Re-runs when steps 2 and 3 come into existence. The band sits below the docked bars.
  useEffect(() => {
    const els = STEPS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el != null,
    );
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [hasPolicy]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <nav
      aria-label="Demo steps"
      className="sticky top-12 z-30 mb-8 border-b border-ink/10 bg-panel"
    >
      <ol className="flex h-10 items-center gap-5 font-mono text-xs uppercase tracking-wide sm:gap-8">
        {STEPS.map((s) => {
          const exists = s.n === 1 || hasPolicy;
          const label = (
            <>
              <span className="hidden sm:inline">STEP </span>
              {s.n} · {s.name}
            </>
          );
          if (!exists) {
            return (
              <li key={s.id} className="text-ink/25">
                {label}
              </li>
            );
          }
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => jump(s.id)}
                aria-current={isActive ? "step" : undefined}
                className={`rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                  isActive ? "font-semibold text-ink" : "text-ink/50 hover:text-ink"
                }`}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
