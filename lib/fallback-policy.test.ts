import { describe, it, expect } from "vitest";
import { policySchema } from "@/lib/policy-schema";
import { FLOOR_POLICY } from "@/lib/fallback-policy";
import { evaluate } from "@/lib/engine";
import { events } from "@/data/events";

describe("floor policy", () => {
  it("is schema-valid", () => {
    expect(() => policySchema.parse(FLOOR_POLICY)).not.toThrow();
  });

  it("has a rationale for every event", () => {
    for (const e of events) {
      expect(FLOOR_POLICY.rationales[e.id as keyof typeof FLOOR_POLICY.rationales]).toBeTruthy();
    }
  });

  it("drives the engine across all fourteen events without throwing", () => {
    for (const e of events) {
      expect(() => evaluate(FLOOR_POLICY, e)).not.toThrow();
    }
  });

  it("reproduces the normal-strictness fixture verdicts", () => {
    for (const e of events) {
      expect(evaluate(FLOOR_POLICY, e).verdict).toBe(e.expectedVerdict);
    }
  });
});
