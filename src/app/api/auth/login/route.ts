import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use Firebase Authentication login and /api/auth/session." },
    { status: 410 }
  );
}
