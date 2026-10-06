import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct signup is disabled. Complete signup through verified payment." },
    { status: 403 }
  );
}
