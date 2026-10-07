import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Password changes are handled securely by Firebase Authentication." },
    { status: 410 }
  );
}
