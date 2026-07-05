import fs from "node:fs";
import path from "node:path";
import { policySchema, type Policy } from "@/lib/policy-schema";
import { profileSchema, type CompanyProfile } from "@/lib/profile";

const PRESETS_DIR = path.join(process.cwd(), "data", "presets");
const BANDS = ["1-25", "26-100", "101-500", "501-2000", "2000+"];
const MATURITY = ["experimenting", "scaling", "dependent"];

// Strictness is weighted highest, then sector, then headcount and maturity by
// their ordinal distance.
function distance(a: CompanyProfile, b: CompanyProfile): number {
  return (
    Math.abs(BANDS.indexOf(a.headcount_band) - BANDS.indexOf(b.headcount_band)) +
    Math.abs(MATURITY.indexOf(a.ai_maturity) - MATURITY.indexOf(b.ai_maturity)) +
    (a.sector === b.sector ? 0 : 3) +
    (a.strictness === b.strictness ? 0 : 5)
  );
}

// Tier one of the fallback: the closest pre-generated preset for a profile, or
// null when data/presets is empty or unreadable (the route then uses the floor).
// Malformed preset files are skipped, never thrown.
export function nearestPreset(profile: CompanyProfile): Policy | null {
  let files: string[];
  try {
    files = fs.readdirSync(PRESETS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    return null;
  }

  let best: { score: number; policy: Policy } | null = null;
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, file), "utf8"));
      const presetProfile = profileSchema.parse(raw.profile);
      const policy = policySchema.parse(raw.policy);
      const score = distance(profile, presetProfile);
      if (best === null || score < best.score) best = { score, policy };
    } catch {
      continue;
    }
  }
  return best === null ? null : best.policy;
}
