"use client";

import { useEffect, useMemo, useState } from "react";
import type { PolicyCore } from "@/lib/policy-schema";
import { STRICTNESSES, type Strictness } from "@/components/demo/presets";
import { PolicyDocument } from "@/components/demo/PolicyDocument";
import { CompactPolicy } from "@/components/demo/CompactPolicy";
import { PolicyJson } from "@/components/demo/PolicyJson";
import { ProgressStages } from "@/components/demo/ProgressStages";
import { diffPaths } from "@/components/demo/diff";

const NONE = new Set<string>();

export function PolicyArtifact({
  policy,
  prevPolicy,
  strictness,
  loading,
  fallback,
  error,
  genId,
  presetServed,
  onStrictness,
  onRegenerate,
}: {
  policy: PolicyCore | null;
  prevPolicy: PolicyCore | null;
  strictness: Strictness;
  loading: boolean;
  fallback: boolean;
  error: boolean;
  genId: number;
  presetServed: boolean;
  onStrictness: (s: Strictness) => void;
  onRegenerate: () => void;
}) {
  const [tab, setTab] = useState<"doc" | "json">("doc");
  const [expanded, setExpanded] = useState(false);
  const [flashing, setFlashing] = useState(false);

  // A generation bumps genId; flash the diff briefly, then go quiet so idle tab
  // switches do not re-flash.
  useEffect(() => {
    setFlashing(true);
    const t = setTimeout(() => setFlashing(false), 1000);
    return () => clearTimeout(t);
  }, [genId]);

  const changed = useMemo(
    () => (flashing && prevPolicy && policy ? diffPaths(prevPolicy, policy) : NONE),
    [flashing, prevPolicy, policy],
  );

  const lineCount = useMemo(
    () => (policy ? JSON.stringify(policy, null, 2).split("\n").length : 0),
    [policy],
  );

  if (!policy && !loading && !error) return null;

  return (
    <div id="step-2" className="mt-10 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">STEP 2 · POLICY</p>
          {policy && (
            <p className="mt-1 text-xs text-ink/40">
              also available as policy.json · {lineCount} lines · schema-validated
            </p>
          )}
        </div>
        {policy && (
          <div className="flex flex-wrap items-center gap-3">
            {presetServed ? (
              <span className="text-xs text-ink/50">
                benchmark preset ·{" "}
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={loading}
                  className="rounded-sm font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50"
                >
                  regenerate live ↻
                </button>
              </span>
            ) : (
              fallback && <span className="text-xs text-ink/50">using cached policy</span>
            )}
            <div className="flex gap-1" role="group" aria-label="Strictness">
              {STRICTNESSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  disabled={loading}
                  onClick={() => onStrictness(s.value)}
                  className={
                    s.value === strictness
                      ? "rounded-full bg-ink px-3 py-1 text-xs font-medium text-ground disabled:opacity-50"
                      : "rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-colors hover:border-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50"
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!policy && loading && (
        <div className="mt-4 flex items-center justify-center rounded-md border border-ink/10 bg-ground py-16">
          <ProgressStages />
        </div>
      )}

      {!policy && !loading && error && (
        <div className="mt-4 flex items-center justify-center rounded-md border border-ink/10 bg-ground py-16 text-sm text-ink/60">
          Generation failed. Try again.
        </div>
      )}

      {policy && (
        <div className="relative mt-4">
          {error && !loading && (
            <p className="mb-3 text-sm text-ink/60">Generation failed. Try again.</p>
          )}

          <div className="mb-3 flex gap-1" role="tablist">
            {(["doc", "json"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={
                  tab === t
                    ? "rounded-full bg-ink px-3 py-1 text-xs font-medium text-ground"
                    : "rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-colors hover:border-ink/40"
                }
              >
                {t === "doc" ? "Document" : "policy.json"}
              </button>
            ))}
          </div>

          <div className="rounded-md border border-ink/10 bg-ground p-5">
            {tab === "doc" ? (
              expanded ? (
                <PolicyDocument policy={policy} changed={changed} />
              ) : (
                <CompactPolicy policy={policy} />
              )
            ) : (
              <PolicyJson policy={policy} changed={changed} />
            )}
          </div>

          {tab === "doc" && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-3 rounded-sm text-sm font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              {expanded ? "Collapse ↑" : "Read the full policy ↓"}
            </button>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-start justify-center rounded-md bg-ground/70 pt-16">
              <ProgressStages />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
