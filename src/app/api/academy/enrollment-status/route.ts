import { NextResponse } from "next/server";
import { enrollmentAvailable } from "@/lib/course-enrollment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Publicly expose plan availability only, never blob URLs or learner records.
// The same fail-closed checks run again on every new payment order.
export async function GET() {
  try {
    const [starter, pro] = await Promise.all([
      enrollmentAvailable("300"),
      enrollmentAvailable("500"),
    ]);
    return NextResponse.json({ starter, pro }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ starter: false, pro: false }, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
