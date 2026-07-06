"use client";

import { useState } from "react";
import type { CompanyProfile } from "@/lib/profile";
import {
  PRESETS,
  HEADCOUNTS,
  SECTORS,
  MATURITIES,
  STRICTNESSES,
  type Headcount,
  type Sector,
  type Maturity,
  type Strictness,
} from "@/components/demo/presets";

function Dial<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              o.value === value
                ? "rounded-full bg-ink px-3 py-1 text-xs font-medium text-ground"
                : "rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition-colors hover:border-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProfileStep({
  onPreset,
  onGenerate,
  disabled,
}: {
  onPreset: (company: string) => void;
  onGenerate: (profile: CompanyProfile) => void;
  disabled: boolean;
}) {
  const [custom, setCustom] = useState(false);
  const [headcount, setHeadcount] = useState<Headcount>("101-500");
  const [sector, setSector] = useState<Sector>("software");
  const [maturity, setMaturity] = useState<Maturity>("scaling");
  const [strictness, setStrictness] = useState<Strictness>("normal");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">STEP 1 · PROFILE</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Pick a company</h2>
      <p className="mt-1 max-w-prose text-sm text-ink/60">
        Choose a preset or set your own. Each one generates a full policy
        calibrated to published industry benchmarks.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onPreset(preset.id)}
            className="rounded-md border border-ink/10 bg-ground p-4 text-left transition-colors hover:border-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50"
          >
            <div className="font-semibold text-ink">{preset.name}</div>
            <div className="mt-1 text-sm text-ink/60">{preset.detail}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setCustom((v) => !v)}
        aria-expanded={custom}
        className="mt-4 rounded-sm text-sm font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        Customize {custom ? "−" : "+"}
      </button>

      {custom && (
        <div className="mt-4 space-y-4 rounded-md border border-ink/10 bg-ground p-4">
          <Dial label="Headcount" options={HEADCOUNTS} value={headcount} onChange={setHeadcount} />
          <Dial label="Sector" options={SECTORS} value={sector} onChange={setSector} />
          <Dial label="AI maturity" options={MATURITIES} value={maturity} onChange={setMaturity} />
          <Dial label="Risk posture" options={STRICTNESSES} value={strictness} onChange={setStrictness} />
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              onGenerate({
                company_name: "Custom company",
                headcount_band: headcount,
                sector,
                ai_maturity: maturity,
                strictness,
              })
            }
            className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:opacity-50"
          >
            Generate policy
          </button>
        </div>
      )}
    </div>
  );
}
