import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";
import { enrollmentFlagEnabled, verifiedCourseAssetsReady, type EnrollmentPlan } from "@/lib/course-enrollment";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";
import { findAvailableFriendInvite, reserveFriendInvite, normalizedInviteEmail } from "@/lib/friend-pro-invite";
import {
  checkoutAmountForPlan,
  isOneRupeeTestCheckout,
} from "@/lib/payment-amounts";

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const allowed = await consumeRateLimit({
      namespace: "payment-order",
      key: clientIp(req),
      limit: 12,
      windowMs: 15 * 60 * 1000,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const plan = String(body?.plan ?? "");
    const token = typeof body?.invite === "string" ? body.invite : null;
    const recipientEmail = normalizedInviteEmail(body?.email);
    const friendInvite = token
      ? await findAvailableFriendInvite(token, recipientEmail)
      : null;

    // An invitation cannot fall back to a public order on invalid email/token.
    if (token && (!friendInvite || plan !== "500" || !recipientEmail)) {
      return NextResponse.json({ error: "This ₹1 Pro invitation is invalid, expired, or belongs to a different email" }, { status: 403 });
    }
    const amount = friendInvite ? 100 : checkoutAmountForPlan(plan);
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const selectedPlan = plan as EnrollmentPlan;
    if (!friendInvite && !enrollmentFlagEnabled(selectedPlan)) {
      return NextResponse.json({
        error: selectedPlan === "500"
          ? "Pro enrollment is not open yet"
          : "Starter enrollment is not open yet",
      }, { status: 503 });
    }

    // A registered recipient must use the existing-account flow. Otherwise
    // payment could succeed before signup detects a duplicate email.
    if (friendInvite && recipientEmail) {
      const registered = await prisma.user.findUnique({ where: { email: recipientEmail } });
      if (registered) {
        return NextResponse.json({
          error: "This email already has an Earnwale account. Please sign in first, then open your private invitation link.",
        }, { status: 409 });
      }
    }

    // Friend invitations do NOT bypass course readiness or learner protection.
    if (!(await verifiedCourseAssetsReady(selectedPlan))) {
      return NextResponse.json({ error: "Course resources are not ready for enrollment" }, { status: 503 });
    }

    // A private invitation reserves a single Razorpay order. A friend who
    // closed the popup can retry that SAME order without paying twice.
    if (friendInvite?.orderId) {
      const previous = await razorpay.orders.fetch(friendInvite.orderId);
      if (Number(previous.amount) !== 100 ||
          String(previous.currency).toUpperCase() !== "INR" ||
          String(previous.notes?.friendInviteId ?? "") !== friendInvite.id ||
          String(previous.notes?.recipientEmail ?? "") !== friendInvite.email ||
          String(previous.notes?.plan ?? "") !== "500" ||
          String(previous.notes?.existingAccount ?? "") === "true" ||
          !["created", "attempted"].includes(String(previous.status))) {
        return NextResponse.json({
          error: "This private checkout is already completed or requires support.",
        }, { status: 409 });
      }
      return NextResponse.json(previous, { headers: { "Cache-Control": "no-store" } });
    }

    const affiliateCode = friendInvite ? "" : String(
      body?.affiliateCode ?? body?.referralCode ?? ""
    ).trim().toUpperCase().slice(0, 32);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `earnwale_${Date.now()}`,
      notes: {
        plan,
        affiliateCode,
        friendInvite: friendInvite ? "true" : "false",
        friendInviteId: friendInvite?.id ?? "",
        recipientEmail: friendInvite?.email ?? "",
        testCheckout: !friendInvite && plan === "300" && isOneRupeeTestCheckout()
          ? "one-rupee-preview" : "false",
      },
    });

    if (friendInvite && recipientEmail) {
      await reserveFriendInvite(friendInvite.id, order.id, recipientEmail);
    }
    return NextResponse.json(order);
  } catch (error: unknown) {
    if (error instanceof Error && /Friend invite already used or expired/.test(error.message)) {
      return NextResponse.json({ error: "This ₹1 invite already has a checkout or has expired. Ask the administrator for assistance." }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
