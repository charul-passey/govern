/**
 * Generates the data/presets fallback policies. Run locally with a key set:
 *
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-presets.ts
 *
 * Three company profiles times three strictness levels, nine files. Each policy is
 * validated against the schema (inside generateWithClaude) and exercised through
 * the engine before it is written. Commit the output; never edit the files by hand.
 */
import fs from "node:fs";
import path from "node:path";
import { policySchema } from "@/lib/policy-schema";
import { profileSchema, type CompanyProfile } from "@/lib/profile";
import { generateWithClaude } from "@/lib/generate-policy";
import { validateRationales } from "@/lib/validate-rationales";
import { evaluate } from "@/lib/engine";
import { events } from "@/data/events";

const OUT_DIR = path.join(process.cwd(), "data", "presets");

const BASE_PROFILES: Omit<CompanyProfile, "strictness">[] = [
  { company_name: "Seed startup", headcount_band: "1-25", sector: "ai_native", ai_maturity: "scaling" },
  { company_name: "Series C SaaS", headcount_band: "101-500", sector: "software", ai_maturity: "scaling" },
  { company_name: "Industrial mfg", headcount_band: "501-2000", sector: "manufacturing", ai_maturity: "experimenting" },
];
const STRICTNESS = ["loose", "normal", "strict"] as const;

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Set ANTHROPIC_API_KEY to generate presets.");
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const base of BASE_PROFILES) {
    for (const strictness of STRICTNESS) {
      const profile = profileSchema.parse({ ...base, strictness });
      const raw = await generateWithClaude(profile);

      // Same validation as the route: replace any rationale the engine disagrees
      // with, so presets are written with validated rationales only.
      const { policy, report } = validateRationales(raw);
      policySchema.parse(policy);

      // Engine check: every event evaluates and the runaway agent always blocks.
      for (const event of events) evaluate(policy, event);
      const e6 = events.find((e) => e.id === "e6");
      if (!e6 || evaluate(policy, e6).verdict !== "blocked") {
        throw new Error(`e6 not blocked for ${profile.company_name} ${strictness}`);
      }

      const file = path.join(OUT_DIR, `${slug(base.company_name)}-${strictness}.json`);
      fs.writeFileSync(file, `${JSON.stringify({ profile, policy }, null, 2)}\n`);
      const note = report.length
        ? `, ${report.length} rationale(s) replaced: ${report.map((r) => `${r.eventId} ${r.reason}`).join(", ")}`
        : "";
      console.log(`wrote ${path.relative(process.cwd(), file)}${note}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
