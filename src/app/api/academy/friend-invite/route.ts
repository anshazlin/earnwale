import { NextResponse } from "next/server";
import { findAvailableFriendInvite } from "@/lib/friend-pro-invite";
import { clientIp } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const allowed = await consumeRateLimit({
      namespace: "friend-pro-lookup",
      key: clientIp(request), limit: 60, windowMs: 15 * 60 * 1000,
    });
    if (!allowed) return NextResponse.json({ valid: false }, { status: 429 });
    const token = new URL(request.url).searchParams.get("invite");
    const record = await findAvailableFriendInvite(token);
    // Invite URLs are unguessable, but never expose the email in public response.
    return NextResponse.json(record
      ? { valid: true, plan: "500", amount: 100 }
      : { valid: false }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ valid: false }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
