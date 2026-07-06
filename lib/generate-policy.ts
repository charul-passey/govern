import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  policySchema,
  policyCoreSchema,
  rationalesSchema,
  type Policy,
  type PolicyCore,
  type Rationales,
} from "@/lib/policy-schema";
import { type CompanyProfile } from "@/lib/profile";
import { events } from "@/data/events";
import { evaluate } from "@/lib/engine";
import { templateFromResult } from "@/lib/rationales";
import { validateRationales } from "@/lib/validate-rationales";
import { nearestPreset } from "@/lib/presets";
import { FLOOR_POLICY } from "@/lib/fallback-policy";
import {
  validateGeneration,
  conformanceMismatches,
  ConformanceError,
  reconcileBenchmark,
  enforceEnvelopeMagnitude,
  enforceTeamSum,
  enforceCanonicalFigures,
  type ReportEntry,
} from "@/lib/validate-generation";

const EMPTY_RATIONALES = Object.fromEntries(
  events.map((e) => [e.id, ""]),
) as Rationales;

const MODEL = "claude-sonnet-4-6";
const TEMPERATURE = 0.3;
const MAX_TOKENS = 4000;

let cachedPrompt: string | null = null;
function systemPrompt(): string {
  if (cachedPrompt === null) {
    cachedPrompt = fs.readFileSync(
      path.join(process.cwd(), "prompts", "policy-skill.md"),
      "utf8",
    );
  }
  return cachedPrompt;
}

export function eventSummaries(): string {
  return events.map((e) => `${e.id} ${e.type}: ${e.description}`).join("\n");
}

export function buildUserMessage(profile: CompanyProfile): string {
  return [
    "COMPANY PROFILE:",
    JSON.stringify(profile, null, 2),
    "",
    "EVENT_SUMMARIES:",
    eventSummaries(),
    "",
    "Return the policy JSON now.",
  ].join("\n");
}

function extractPolicy(text: string): Policy {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in response");
  return policySchema.parse(JSON.parse(text.slice(start, end + 1)));
}

function describeError(err: unknown, profile: CompanyProfile): string {
  return err instanceof z.ZodError
    ? `Schema errors: ${JSON.stringify(err.issues)}`
    : err instanceof ConformanceError
      ? `The rules engine produced the wrong verdicts at ${profile.strictness} strictness. Adjust the policy so these verdicts come out right: ${JSON.stringify(err.mismatches)}`
      : String(err);
}

export interface GenerationTrace {
  policy: Policy;
  source: "live" | "retry"; // live = passed first attempt, retry = needed a second
  firstTrySchemaValid: boolean;
}

// Calls Claude and validates (schema, then verdict conformance). On failure,
// retries once with the error appended. Throws if the second attempt also fails.
// Returns a trace so callers can tell whether a retry was needed.
export async function generateTraced(
  profile: CompanyProfile,
): Promise<GenerationTrace> {
  const client = new Anthropic();
  const system = systemPrompt();
  const user = buildUserMessage(profile);

  const ask = async (content: string): Promise<string> => {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system,
      messages: [{ role: "user", content }],
    });
    return res.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
  };

  let firstTrySchemaValid = false;
  let firstError: unknown;
  try {
    const policy = extractPolicy(await ask(user));
    firstTrySchemaValid = true;
    const mismatches = conformanceMismatches(policy, profile);
    if (mismatches.length > 0) throw new ConformanceError(mismatches);
    return { policy, source: "live", firstTrySchemaValid: true };
  } catch (err) {
    firstError = err;
  }

  const retryPrompt = `${user}\n\nYour previous output failed validation:\n${describeError(firstError, profile)}\n\nReturn corrected JSON only, matching the schema exactly.`;
  const policy = extractPolicy(await ask(retryPrompt));
  const mismatches = conformanceMismatches(policy, profile);
  if (mismatches.length > 0) throw new ConformanceError(mismatches);
  return { policy, source: "retry", firstTrySchemaValid };
}

// Thin wrapper: the policy only. Throws if generation fails after the retry.
export async function generateWithClaude(profile: CompanyProfile): Promise<Policy> {
  return (await generateTraced(profile)).policy;
}

export interface GenerateResult {
  policy: Policy;
  source: "generated" | "preset" | "floor";
  fallback: boolean;
  reason?: string;
  report?: ReportEntry[];
}

function cached(profile: CompanyProfile, reason: string): GenerateResult {
  const preset = nearestPreset(profile);
  return preset
    ? { policy: preset, source: "preset", fallback: true, reason }
    : { policy: FLOOR_POLICY, source: "floor", fallback: true, reason };
}

// Resolution order: live generation, then nearest preset, then floor. Never
// throws; the caller can trust the returned policy.
export async function resolvePolicy(
  profile: CompanyProfile,
): Promise<GenerateResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const raw = await generateWithClaude(profile);
      // The engine, not the model, is the source of truth: reconcile the
      // benchmark, validate rationales, and enforce the canonical figures.
      const { policy, report } = validateGeneration(raw, profile);
      return { policy, source: "generated", fallback: false, report };
    } catch {
      return cached(profile, "generation_failed");
    }
  }
  return cached(profile, "no_api_key");
}

// ---------------------------------------------------------------------------
// Two-phase live generation (used by the demo). Phase one returns a validated
// policy without rationales for a fast first paint; phase two writes and
// validates the rationales in the background. The single-call generateWithClaude
// above, the presets script, and the floor policy are all unchanged.
// ---------------------------------------------------------------------------

async function askModel(system: string, content: string, maxTokens: number): Promise<string> {
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature: TEMPERATURE,
    system,
    messages: [{ role: "user", content }],
  });
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

function extractCore(text: string): PolicyCore {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in response");
  return policyCoreSchema.parse(JSON.parse(text.slice(start, end + 1)));
}

// Phase one: policy without rationales, with a retry on schema or conformance failure.
async function generateCoreWithClaude(profile: CompanyProfile): Promise<PolicyCore> {
  const system = systemPrompt();
  const base = `${buildUserMessage(profile)}\n\nRespond with the policy JSON but OMIT the rationales field entirely. Rationales are generated in a separate step.`;

  const attempt = async (content: string): Promise<PolicyCore> => {
    const core = extractCore(await askModel(system, content, MAX_TOKENS));
    const mismatches = conformanceMismatches(core as unknown as Policy, profile);
    if (mismatches.length > 0) throw new ConformanceError(mismatches);
    return core;
  };

  try {
    return await attempt(base);
  } catch (err) {
    const retry = `${base}\n\nYour previous output failed validation:\n${describeError(err, profile)}\n\nReturn corrected JSON only.`;
    return await attempt(retry);
  }
}

// Phase two: rationales for an already-generated policy.
async function generateRationalesWithClaude(
  profile: CompanyProfile,
  core: PolicyCore,
): Promise<Rationales> {
  const system = systemPrompt();
  const user = [
    "COMPANY PROFILE:",
    JSON.stringify(profile, null, 2),
    "",
    "GENERATED POLICY (rationales omitted):",
    JSON.stringify(core, null, 2),
    "",
    "EVENT_SUMMARIES:",
    eventSummaries(),
    "",
    "Return ONLY a JSON object mapping e1 through e14 to a one-sentence rationale each, written as the policy engine explaining its verdict against the concrete numbers in this policy. No other fields.",
  ].join("\n");
  const text = await askModel(system, user, 1500);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no JSON object in response");
  return rationalesSchema.parse(JSON.parse(text.slice(start, end + 1)));
}

function templateAllRationales(core: PolicyCore): Rationales {
  const full = { ...core, rationales: EMPTY_RATIONALES } as Policy;
  return Object.fromEntries(
    events.map((e) => [e.id, templateFromResult(full, e, evaluate(full, e))]),
  ) as Rationales;
}

export interface Phase1Result {
  policy: PolicyCore;
  rationales: Rationales | null;
  source: "generated" | "preset" | "floor";
  fallback: boolean;
  rationalesPending: boolean;
  report: ReportEntry[];
}

// Cached phase-one fallback: the nearest preset or floor, which already carry
// rationales, so no phase two is needed.
export function cachedPhase1(profile: CompanyProfile): Phase1Result {
  const preset = nearestPreset(profile);
  const full = preset ?? FLOOR_POLICY;
  const { rationales, ...core } = full;
  return {
    policy: core,
    rationales,
    source: preset ? "preset" : "floor",
    fallback: true,
    rationalesPending: false,
    report: [],
  };
}

// Cached phase-two fallback: deterministic template rationales for a policy.
export function cachedRationales(core: PolicyCore): {
  rationales: Rationales;
  report: ReportEntry[];
} {
  return { rationales: templateAllRationales(core), report: [] };
}

// Phase one resolution: live core generation with the numeric validators, else a
// full cached fallback (which already carries rationales).
export async function resolvePolicyPhase1(profile: CompanyProfile): Promise<Phase1Result> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const core = await generateCoreWithClaude(profile);
      const seeded = { ...core, rationales: EMPTY_RATIONALES } as Policy;
      const envelope = enforceEnvelopeMagnitude(seeded, profile);
      const team = enforceTeamSum(envelope.policy);
      const benchmark = reconcileBenchmark(team.policy, profile);
      const report: ReportEntry[] = [];
      if (envelope.entry) report.push(envelope.entry);
      if (team.entry) report.push(team.entry);
      if (benchmark.entry) report.push(benchmark.entry);
      const { rationales: _drop, ...validatedCore } = benchmark.policy;
      void _drop;
      return {
        policy: validatedCore,
        rationales: null,
        source: "generated",
        fallback: false,
        rationalesPending: true,
        report,
      };
    } catch {
      // fall through to a cached policy
    }
  }
  return cachedPhase1(profile);
}

// Phase two resolution: live rationales with validation, else deterministic templates.
export async function resolveRationalesPhase2(
  profile: CompanyProfile,
  core: PolicyCore,
): Promise<{ rationales: Rationales; report: ReportEntry[] }> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const raw = await generateRationalesWithClaude(profile, core);
      const full = { ...core, rationales: raw } as Policy;
      const validated = validateRationales(full);
      const canonical = enforceCanonicalFigures(validated.policy);
      const report: ReportEntry[] = [
        ...validated.report.map((r) => ({
          check: "rationale" as const,
          eventId: r.eventId,
          reason: r.reason,
          engineVerdict: r.engineVerdict,
          expectedVerdict: r.expectedVerdict,
        })),
        ...canonical.entries,
      ];
      return { rationales: canonical.policy.rationales, report };
    } catch {
      // fall through to templates
    }
  }
  return cachedRationales(core);
}
