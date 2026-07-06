"use client";

import { useEffect, useState } from "react";
import type { Tally } from "@/lib/engine";

function useCountUp(target: number, reduced: boolean): number {
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setN(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 800;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(target * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return n;
}

type Kind = "usd" | "usd_year" | "plain";

function format(value: number, kind: Kind): string {
  if (kind === "usd") return `$${value.toLocaleString("en-US")}`;
  if (kind === "usd_year") return `$${value.toLocaleString("en-US")}/yr`;
  return String(value);
}

function Stat({
  target,
  kind,
  label,
  reduced,
}: {
  target: number;
  kind: Kind;
  label: string;
  reduced: boolean;
}) {
  const n = useCountUp(target, reduced);
  return (
    <div>
      <div className="font-mono text-2xl font-bold tracking-tight text-ink">
        {format(n, kind)}
      </div>
      <div className="mt-0.5 text-sm text-ink/70">{label}</div>
    </div>
  );
}

export function TallyStrip({
  tally,
  reduced,
  animate = true,
}: {
  tally: Tally;
  reduced: boolean;
  animate?: boolean;
}) {
  return (
    <div className={`rounded-md bg-accent p-6 ${animate ? "animate-slide-fade-in" : ""}`}>
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat target={tally.blockedBurnUsd} kind="usd" label="runaway burn blocked" reduced={reduced} />
        <Stat target={tally.reroutedUsdYear} kind="usd_year" label="rerouted to contracts" reduced={reduced} />
        <Stat target={tally.consolidationUsdYear} kind="usd_year" label="consolidation identified" reduced={reduced} />
        <Stat
          target={tally.agentsCaught}
          kind="plain"
          label={tally.agentsCaught === 1 ? "agent caught" : "agents caught"}
          reduced={reduced}
        />
        <Stat target={tally.reviewHours} kind="plain" label="human review-hours spent" reduced={reduced} />
      </div>
      <p className="mt-5 text-xs text-ink/70">
        Every verdict in this feed traces to a clause you can read in the policy JSON.
        That is the difference between a dashboard and a policy engine.
      </p>
    </div>
  );
}
