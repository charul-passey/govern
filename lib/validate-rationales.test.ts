import { describe, it, expect } from "vitest";
import { validateRationales } from "@/lib/validate-rationales";
import { FLOOR_POLICY } from "@/lib/fallback-policy";
import type { Policy } from "@/lib/policy-schema";

describe("validateRationales", () => {
  it("leaves a consistent policy untouched", () => {
    const { report } = validateRationales(FLOOR_POLICY);
    expect(report).toEqual([]);
  });

  it("replaces a rationale that names a clause the engine did not fire", () => {
    // e1 is a routine api_usage approval; the kill threshold never fires there.
    const tampered: Policy = {
      ...FLOOR_POLICY,
      rationales: {
        ...FLOOR_POLICY.rationales,
        e1: "Suspended at the kill threshold.",
      },
    };
    const { policy, report } = validateRationales(tampered);
    const e1 = report.find((r) => r.eventId === "e1");
    expect(e1?.reason).toBe("clause_reference");
    expect(policy.rationales.e1).not.toBe("Suspended at the kill threshold.");
    expect(policy.rationales.e1.toLowerCase()).not.toContain("kill threshold");
  });

  it("replaces a rationale when the engine verdict class differs from expected", () => {
    // Raise the burn alert so e13 no longer trips: engine now approves, but the
    // fixture expects alert_burn.
    const tampered: Policy = {
      ...FLOOR_POLICY,
      budgets: { ...FLOOR_POLICY.budgets, burn_alert_pct: 99 },
    };
    const { policy, report } = validateRationales(tampered);
    const e13 = report.find((r) => r.eventId === "e13");
    expect(e13?.reason).toBe("verdict_mismatch");
    expect(e13?.engineVerdict).toBe("approved");
    expect(e13?.expectedVerdict).toBe("alert_burn");
    expect(policy.rationales.e13).toContain("Approved");
  });
});
