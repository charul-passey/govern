"use client";

import { useState } from "react";
import type { Event, Verdict } from "@/data/events";
import { VERDICT_META, type Tone, type Weight } from "@/components/demo/verdict-meta";

const CARD: Record<Weight, string> = {
  quiet: "rounded-md border border-ink/10 bg-ground p-3",
  catch: "rounded-md border border-ink/15 bg-ground p-4",
  heavy: "rounded-md border-2 border-verdict-blocked bg-verdict-blocked/5 p-5 shadow-sm",
};

const BADGE: Record<Tone, string> = {
  approved: "border-verdict-approved/40 text-verdict-approved",
  caution: "border-verdict-caution/40 text-verdict-caution",
  blocked: "border-verdict-blocked/60 text-verdict-blocked font-semibold",
  neutral: "border-ink/15 text-ink/50",
};

export function VerdictCard({
  event,
  verdict,
  firedClauses,
  rationale,
  onClause,
  animate = true,
}: {
  event: Event;
  verdict: Verdict;
  firedClauses: string[];
  rationale: string;
  onClause: (clause: string) => void;
  animate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = VERDICT_META[verdict];

  return (
    <div className={`${CARD[meta.weight]}${animate ? " animate-slide-fade-in" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-ink/50">{event.timestamp}</span>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${BADGE[meta.tone]}`}
        >
          {meta.label}
        </span>
      </div>
      <p className={meta.weight === "quiet" ? "mt-1.5 text-sm text-ink/70" : "mt-1.5 text-sm text-ink"}>
        {event.description}
      </p>
      {rationale && <p className="mt-1 text-sm text-ink/60">{rationale}</p>}
      {firedClauses.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="rounded-sm text-xs font-medium text-ink/50 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Receipts {open ? "−" : "+"}
          </button>
          {open && (
            <ul className="mt-1.5 space-y-1">
              {firedClauses.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => onClause(c)}
                    className="break-all rounded-sm text-left font-mono text-xs text-ink/70 underline-offset-2 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
