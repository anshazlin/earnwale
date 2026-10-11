import { NextResponse } from "next/server";
// Deprecated Scholar/Capital PDF downloads were removed from the active catalog.
// Returning 410 avoids exposing stale files or silently serving unrelated content.
export async function GET() {
  return NextResponse.json({ error: "This learning resource has been retired. Visit My Courses for the current Earnwale Trading Academy." }, { status: 410 });
}
