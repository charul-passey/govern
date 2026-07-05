/**
 * Live generation eval. Runs each profile in scripts/eval-profiles.json through the
 * live generation path only (no preset or floor fallback). Writes each result to
 * eval-output/NN.json and prints a factual summary table. It does not grade the
 * policies; the columns are raw observations for a human reviewer.
 *
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/eval.ts [limit]
 */
import fs from "node:fs";
import path from "node:path";
import { profileSchema, type CompanyProfile } from "@/lib/profile";
import { generateTraced } from "@/lib/generate-policy";
import { validateGeneration, expectedBenchmarkMultiple } from "@/lib/validate-generation";
import { evaluate } from "@/lib/engine";
import { events } from "@/data/events";

const PROFILES_FILE = path.join(process.cwd(), "scripts", "eval-profiles.json");
const OUT_DIR = path.join(process.cwd(), "eval-output");

interface Row {
  profile: string;
  source: string;
  schemaFirstTry: string;
  envelopeSumPct: string;
  e6Blocked: string;
  benchmark: string;
}

function loadProfiles(): CompanyProfile[] {
  const raw = JSON.parse(fs.readFileSync(PROFILES_FILE, "utf8"));
  if (!Array.isArray(raw)) throw new Error("eval-profiles.json must be a JSON array");
  return raw.map((p) => profileSchema.parse(p));
}

function printTable(rows: Row[]): void {
  const cols: { key: keyof Row; head: string }[] = [
    { key: "profile", head: "profile" },
    { key: "source", head: "source" },
    { key: "schemaFirstTry", head: "schema 1st" },
    { key: "envelopeSumPct", head: "env sum %" },
    { key: "e6Blocked", head: "e6 block" },
    { key: "benchmark", head: "bench stated/computed" },
  ];
  const width = (c: { key: keyof Row; head: string }) =>
    Math.max(c.head.length, ...rows.map((r) => String(r[c.key]).length));
  const widths = cols.map(width);
  const line = (cells: string[]) => cells.map((c, i) => c.padEnd(widths[i])).join("  ");
  console.log("");
  console.log(line(cols.map((c) => c.head)));
  console.log(line(widths.map((w) => "-".repeat(w))));
  for (const r of rows) console.log(line(cols.map((c) => String(r[c.key]))));
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Set ANTHROPIC_API_KEY to run the eval.");
  }
  const profiles = loadProfiles();
  const limit = Number(process.argv[2]) || profiles.length;
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const e6 = events.find((e) => e.id === "e6");
  if (!e6) throw new Error("e6 missing from the event fixture");

  const rows: Row[] = [];
  for (let i = 0; i < Math.min(limit, profiles.length); i += 1) {
    const profile = profiles[i];
    const n = String(i + 1).padStart(2, "0");
    const label = `${profile.company_name}/${profile.strictness}`;

    try {
      // Full live path only (generate, then validate). No preset or floor
      // fallback. If it throws after the retry, that is a failure.
      const trace = await generateTraced(profile);
      const { source, firstTrySchemaValid } = trace;
      const { policy, report } = validateGeneration(trace.policy, profile);

      const teamSum = policy.budgets.team_envelopes.reduce((s, t) => s + t.usd_month, 0);
      const envelopeSumPct = Math.round(
        (teamSum / policy.budgets.company_envelope_usd_month) * 100,
      );
      const e6Blocked = evaluate(policy, e6).verdict === "blocked";
      const stated = policy.budgets.benchmark.envelope_multiple_of_median;
      const { computed } = expectedBenchmarkMultiple(policy, profile);

      fs.writeFileSync(
        path.join(OUT_DIR, `${n}.json`),
        `${JSON.stringify(
          {
            index: i + 1,
            profile,
            ok: true,
            source,
            firstTrySchemaValid,
            metrics: { envelopeSumPct, e6Blocked, benchmarkStated: stated, benchmarkComputed: computed },
            report,
            modelRationales: trace.policy.rationales,
            policy,
          },
          null,
          2,
        )}\n`,
      );

      rows.push({
        profile: label,
        source,
        schemaFirstTry: firstTrySchemaValid ? "yes" : "no",
        envelopeSumPct: `${envelopeSumPct}%`,
        e6Blocked: e6Blocked ? "yes" : "no",
        benchmark: `${stated} / ${computed}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      fs.writeFileSync(
        path.join(OUT_DIR, `${n}.json`),
        `${JSON.stringify({ index: i + 1, profile, ok: false, error: message }, null, 2)}\n`,
      );
      rows.push({
        profile: label,
        source: "FAILED",
        schemaFirstTry: "-",
        envelopeSumPct: "-",
        e6Blocked: "-",
        benchmark: "-",
      });
      console.error(`FAIL ${label}: ${message}`);
    }
  }

  printTable(rows);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
