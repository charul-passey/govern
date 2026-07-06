"use client";

import { useState } from "react";
import type { PolicyCore, Rationales } from "@/lib/policy-schema";
import type { CompanyProfile } from "@/lib/profile";
import { ProfileStep } from "@/components/demo/ProfileStep";
import { PolicyArtifact } from "@/components/demo/PolicyArtifact";
import { Simulator } from "@/components/demo/Simulator";
import { PRESET_POLICIES } from "@/components/demo/preset-policies";
import type { Strictness } from "@/components/demo/presets";

type DemoPolicy = PolicyCore & { rationales?: Rationales };

type Origin =
  | { kind: "preset"; company: string }
  | { kind: "custom"; profile: CompanyProfile }
  | null;

interface Phase1Response {
  policy: PolicyCore;
  rationales: Rationales | null;
  fallback: boolean;
  rationalesPending: boolean;
}
interface Phase2Response {
  rationales: Rationales;
}

const HEADERS = { "content-type": "application/json" };

export function Demo() {
  const [policy, setPolicy] = useState<DemoPolicy | null>(null);
  const [prevPolicy, setPrevPolicy] = useState<DemoPolicy | null>(null);
  const [origin, setOrigin] = useState<Origin>(null);
  const [strictness, setStrictness] = useState<Strictness>("normal");
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [error, setError] = useState(false);
  const [genId, setGenId] = useState(0);

  // Live, two-phase: render the policy first, attach rationales in the background.
  async function liveGenerate(profile: CompanyProfile) {
    setLoading(true);
    setError(false);
    setFallback(false);
    const current = policy;
    try {
      const res1 = await fetch("/api/generate-policy", {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ profile, phase: "policy" }),
      });
      const d1 = (await res1.json()) as Phase1Response;
      setPrevPolicy(current);
      setPolicy(d1.rationales ? { ...d1.policy, rationales: d1.rationales } : d1.policy);
      setStrictness(profile.strictness);
      setFallback(Boolean(d1.fallback));
      setGenId((n) => n + 1);
      setLoading(false);

      if (d1.rationalesPending) {
        const res2 = await fetch("/api/generate-policy", {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify({ profile, phase: "rationales", policy: d1.policy }),
        });
        const d2 = (await res2.json()) as Phase2Response;
        setPolicy((p) => (p ? { ...p, rationales: d2.rationales } : p));
      }
    } catch {
      setLoading(false);
      setError(true);
    }
  }

  function selectPreset(company: string) {
    const f = PRESET_POLICIES[company].normal;
    setPrevPolicy(null);
    setPolicy(f.policy);
    setOrigin({ kind: "preset", company });
    setStrictness("normal");
    setFallback(false);
    setError(false);
    setGenId((n) => n + 1);
  }

  function changeStrictness(s: Strictness) {
    if (!origin) return;
    if (origin.kind === "preset") {
      // Swap the committed file instantly; the JSON diff still highlights changes.
      const f = PRESET_POLICIES[origin.company][s];
      setPrevPolicy(policy);
      setPolicy(f.policy);
      setStrictness(s);
      setError(false);
      setGenId((n) => n + 1);
    } else {
      void liveGenerate({ ...origin.profile, strictness: s });
    }
  }

  function customize(profile: CompanyProfile) {
    setOrigin({ kind: "custom", profile });
    void liveGenerate(profile);
  }

  function regenerateLive() {
    if (origin?.kind !== "preset") return;
    const profile: CompanyProfile = {
      ...PRESET_POLICIES[origin.company][strictness].profile,
      strictness,
    };
    setOrigin({ kind: "custom", profile });
    void liveGenerate(profile);
  }

  return (
    <section id="demo" className="bg-panel px-6 py-20 sm:py-24">
      <div className="mx-auto max-w-shell">
        <ProfileStep
          onPreset={selectPreset}
          onGenerate={customize}
          disabled={loading}
          activeCompany={origin?.kind === "preset" ? origin.company : null}
          customActive={origin?.kind === "custom"}
        />
        <PolicyArtifact
          policy={policy}
          prevPolicy={prevPolicy}
          strictness={strictness}
          loading={loading}
          fallback={fallback}
          error={error}
          genId={genId}
          presetServed={origin?.kind === "preset"}
          onStrictness={changeStrictness}
          onRegenerate={regenerateLive}
        />
        {policy && <Simulator policy={policy} />}
      </div>
    </section>
  );
}
