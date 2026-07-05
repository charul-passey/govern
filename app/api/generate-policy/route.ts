import { NextResponse, type NextRequest } from "next/server";
import { profileSchema } from "@/lib/profile";
import { resolvePolicy } from "@/lib/generate-policy";
import { rateLimit } from "@/lib/rate-limit";
import { nearestPreset } from "@/lib/presets";
import { FLOOR_POLICY } from "@/lib/fallback-policy";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "local";
}

async function readProfile(req: NextRequest) {
  try {
    return profileSchema.safeParse(await req.json());
  } catch {
    return { success: false } as const;
  }
}

// Fail-soft POST. Every path returns a usable policy and a fallback flag; a raw
// error is never surfaced to the UI.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  // Rate limited: return a cached policy without calling the model.
  if (!rateLimit(ip)) {
    const parsed = await readProfile(req);
    const preset = parsed.success ? nearestPreset(parsed.data) : null;
    return NextResponse.json({
      policy: preset ?? FLOOR_POLICY,
      source: preset ? "preset" : "floor",
      fallback: true,
      reason: "rate_limited",
    });
  }

  const parsed = await readProfile(req);
  if (!parsed.success) {
    return NextResponse.json({
      policy: FLOOR_POLICY,
      source: "floor",
      fallback: true,
      reason: "invalid_profile",
    });
  }

  try {
    return NextResponse.json(await resolvePolicy(parsed.data));
  } catch {
    return NextResponse.json({
      policy: FLOOR_POLICY,
      source: "floor",
      fallback: true,
      reason: "error",
    });
  }
}
