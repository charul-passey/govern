import type { Verdict } from "@/data/events";

export type Tone = "approved" | "caution" | "blocked" | "neutral";
export type Weight = "quiet" | "catch" | "heavy";

// Shared verdict presentation: badge label, visual tone, and card weight. Used by
// the verdict cards and the burn-timeline dots.
export const VERDICT_META: Record<Verdict, { label: string; tone: Tone; weight: Weight }> = {
  approved: { label: "Approved", tone: "approved", weight: "quiet" },
  approval_recommended: { label: "Approval recommended", tone: "caution", weight: "catch" },
  approval_required: { label: "Approval required", tone: "caution", weight: "catch" },
  flagged_variance: { label: "Flagged: variance", tone: "caution", weight: "catch" },
  flagged_consolidation: { label: "Flagged: consolidation", tone: "caution", weight: "catch" },
  rerouted_shadow: { label: "Rerouted", tone: "caution", weight: "catch" },
  throttled: { label: "Throttled", tone: "caution", weight: "catch" },
  alert_burn: { label: "Burn alert", tone: "caution", weight: "catch" },
  blocked: { label: "Blocked", tone: "blocked", weight: "heavy" },
  week_closed: { label: "Week closed", tone: "neutral", weight: "quiet" },
};
