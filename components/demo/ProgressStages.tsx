"use client";

import { useEffect, useState } from "react";

// Verbatim from content/site-copy.md, shown in order during live generation.
const STAGES = [
  "Pulling sector benchmarks",
  "Calibrating envelopes",
  "Writing enforcement clauses",
  "Validating against the engine",
];

export function ProgressStages() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((n) => Math.min(n + 1, STAGES.length - 1)),
      700,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <span role="status" className="text-sm text-ink/60">
      {STAGES[i]}…
    </span>
  );
}
