import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { policySchema, type Policy } from "@/lib/policy-schema";
import { type CompanyProfile } from "@/lib/profile";
import { events } from "@/data/events";
import { nearestPreset } from "@/lib/presets";
import { FLOOR_POLICY } from "@/lib/fallback-policy";
import { validateRationales, type RationaleReplacement } from "@/lib/validate-rationales";

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

// Calls Claude and validates. On schema failure, retries once with the validation
// errors appended. Throws if the second attempt also fails; the caller falls back.
export async function generateWithClaude(profile: CompanyProfile): Promise<Policy> {
  const client = new Anthropic();
  const system = systemPrompt();
  const user = buildUserMessage(profile);

  const call = async (content: string): Promise<Policy> => {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system,
      messages: [{ role: "user", content }],
    });
    const text = res.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
    return extractPolicy(text);
  };

  try {
    return await call(user);
  } catch (err) {
    const detail =
      err instanceof z.ZodError ? JSON.stringify(err.issues) : String(err);
    const retry = `${user}\n\nYour previous output failed validation:\n${detail}\n\nReturn corrected JSON only, matching the schema exactly.`;
    return await call(retry);
  }
}

export interface GenerateResult {
  policy: Policy;
  source: "generated" | "preset" | "floor";
  fallback: boolean;
  reason?: string;
  report?: RationaleReplacement[];
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
      // The engine, not the model, is the source of truth for rationales.
      const { policy, report } = validateRationales(raw);
      return { policy, source: "generated", fallback: false, report };
    } catch {
      return cached(profile, "generation_failed");
    }
  }
  return cached(profile, "no_api_key");
}
