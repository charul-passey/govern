import { NextResponse } from "next/server";

// Stub. Policy generation is wired in a later session.
export async function POST() {
  return NextResponse.json(
    { error: "Not implemented" },
    { status: 501 },
  );
}
