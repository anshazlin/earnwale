import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  activeFriendInvite, createFriendInvite, normalizedInviteEmail,
  type FriendInviteRecord,
} from "@/lib/friend-pro-invite";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function authorised(request: Request) {
  await requireAdmin(request);
  if (!isSameOriginRequest(request) && request.method !== "GET") {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const records = await prisma.friendInvite.findMany({
      orderBy: { createdAt: "desc" }, take: 30,
    }) as FriendInviteRecord[];
    return NextResponse.json({
      invites: records.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt,
        reserved: Boolean(invite.orderId),
        amount: invite.amount,
        plan: invite.plan,
      })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const denied = await authorised(request);
    if (denied) return denied;
    const allowed = await consumeRateLimit({
      namespace: "friend-pro-admin-create",
      key: clientIp(request), limit: 12, windowMs: 24 * 60 * 60 * 1000,
    });
    if (!allowed) return NextResponse.json({ error: "Invite limit reached for today" }, { status: 429 });

    const body = await request.json();
    const email = normalizedInviteEmail(body?.email);
    if (!email) return NextResponse.json({ error: "Enter a valid recipient email" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (String(user?.plan ?? "") === "500") {
      return NextResponse.json({ error: "This email already has Pro access" }, { status: 409 });
    }

    const prior = await prisma.friendInvite.findMany({ where: { email } }) as FriendInviteRecord[];
    if (prior.some((invite) => activeFriendInvite(invite) || (invite.status === "pending" && invite.orderId))) {
      return NextResponse.json({
        error: "An active or reserved invite already exists for this email. Revoke the unused invite or contact support.",
      }, { status: 409 });
    }

    const invite = await createFriendInvite(email);
    const url = new URL("/signup", request.url);
    url.searchParams.set("plan", "500");
    url.searchParams.set("invite", invite.token);
    return NextResponse.json({
      success: true, url: url.toString(), email, expiresAt: invite.expiresAt,
      amount: 100, plan: "500",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    const denied = await authorised(request);
    if (denied) return denied;
    const body = await request.json();
    const id = String(body?.id ?? "");
    if (!/^friend_[a-f0-9]{64}$/.test(id)) {
      return NextResponse.json({ error: "Invalid invite" }, { status: 400 });
    }
    const invite = await prisma.friendInvite.findUnique({ where: { id } }) as FriendInviteRecord | null;
    if (!invite || invite.status !== "pending") {
      return NextResponse.json({ error: "Invite unavailable" }, { status: 409 });
    }
    // Once Razorpay has an order, never invalidate it while a payment may be in flight.
    if (invite.orderId) {
      return NextResponse.json({
        error: "Checkout already started. This invitation cannot be revoked during payment.",
      }, { status: 409 });
    }
    await prisma.$transaction(async (tx: typeof prisma) => {
      const current = await tx.friendInvite.findUnique({ where: { id } }) as FriendInviteRecord | null;
      if (!current || current.status !== "pending" || current.orderId) {
        throw new Error("Invitation cannot be revoked");
      }
      await tx.friendInvite.update({ where: { id }, data: { status: "revoked" } });
    });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
