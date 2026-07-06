"use client";

import { useState } from "react";
import type { PolicyCore } from "@/lib/policy-schema";
import { STRICTNESSES, type Strictness } from "@/components/demo/presets";
import { PolicyDocument } from "@/components/demo/PolicyDocument";
import { PolicyJson } from "@/components/demo/PolicyJson";
import { ProgressStages } from "@/components/demo/ProgressStages";

export function PolicyArtifact({
  policy,
  prevPolicy,
  strictness,
  loading,
  fallback,
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
  genId: number;
  presetServed: boolean;
  onStrictness: (s: Strictness) => void;
  onRegenerate: () => void;
}) {
  const [tab, setTab] = useState<"doc" | "json">("doc");

  // Step 2 appears once there is something to show.
  if (!policy && !loading) return null;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">STEP 2 · POLICY</p>
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

      {policy && (
        <div className="relative mt-4">
          <div className="mb-3 flex gap-1 sm:hidden" role="tablist">
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
                    : "rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70"
                }
              >
                {t === "doc" ? "Policy" : "JSON"}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={`${tab === "doc" ? "block" : "hidden"} rounded-md border border-ink/10 bg-ground p-5 sm:block`}
            >
              <PolicyDocument policy={policy} />
            </div>
            <div
              className={`${tab === "json" ? "block" : "hidden"} rounded-md border border-ink/10 bg-ground p-5 sm:block`}
            >
              <PolicyJson key={genId} policy={policy} prevPolicy={prevPolicy} />
            </div>
          </div>

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
