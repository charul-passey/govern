import { NextResponse, type NextRequest } from "next/server";
import { profileSchema } from "@/lib/profile";
import { policyCoreSchema } from "@/lib/policy-schema";
import {
  resolvePolicyPhase1,
  resolveRationalesPhase2,
  cachedPhase1,
  cachedRationales,
} from "@/lib/generate-policy";
import { rateLimit } from "@/lib/rate-limit";
import { FLOOR_POLICY } from "@/lib/fallback-policy";

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "local";
}

// Two-phase, fail-soft. phase "policy" (default) returns a validated policy
// without rationales; phase "rationales" returns validated rationales for a
// supplied policy. A raw error is never surfaced.
export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  let body: { profile?: unknown; phase?: unknown; policy?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (body.phase === "rationales") {
    const profile = profileSchema.safeParse(body.profile);
    const core = policyCoreSchema.safeParse(body.policy);
    if (!profile.success || !core.success) {
      return NextResponse.json({ rationales: {}, report: [] });
    }
    if (!rateLimit(ip)) {
      return NextResponse.json(cachedRationales(core.data));
    }
    return NextResponse.json(await resolveRationalesPhase2(profile.data, core.data));
  }

  // phase: policy
  const profile = profileSchema.safeParse(body.profile);
  if (!profile.success) {
    const { rationales, ...core } = FLOOR_POLICY;
    return NextResponse.json({
      policy: core,
      rationales,
      source: "floor",
      fallback: true,
      rationalesPending: false,
      report: [],
      reason: "invalid_profile",
    });
  }
  if (!rateLimit(ip)) {
    return NextResponse.json({ ...cachedPhase1(profile.data), reason: "rate_limited" });
  }
  return NextResponse.json(await resolvePolicyPhase1(profile.data));
}
