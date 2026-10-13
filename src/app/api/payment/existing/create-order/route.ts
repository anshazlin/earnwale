import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import {
  enrollmentFlagEnabled,
  verifiedCourseAssetsReady,
  type EnrollmentPlan,
} from "@/lib/course-enrollment";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";
import { findAvailableFriendInvite, reserveFriendInvite } from "@/lib/friend-pro-invite";
import {
  checkoutAmountForPlan,
  isOneRupeeTestCheckout,
} from "@/lib/payment-amounts";

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const { user } = await requireAuth(req);

    const allowed = await consumeRateLimit({
      namespace: "existing-payment-order",
      key: `${user.id}:${clientIp(req)}`,
      limit: 10,
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
    const friendInvite = token ? await findAvailableFriendInvite(token, user.email) : null;
    if (token && (!friendInvite || plan !== "500")) {
      return NextResponse.json({ error: "This ₹1 Pro invite is not valid for your signed-in email" }, { status: 403 });
    }

    const amount = friendInvite ? 100 : checkoutAmountForPlan(plan);
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const currentPlan = String(user.plan ?? "").trim();
    if (currentPlan && !(friendInvite && currentPlan === "300")) {
      return NextResponse.json({
        error: "This account already has course access. Contact support for plan changes.",
      }, { status: 409 });
    }

    const selectedPlan = plan as EnrollmentPlan;
    if (!friendInvite && !enrollmentFlagEnabled(selectedPlan)) {
      return NextResponse.json({
        error: selectedPlan === "500"
          ? "Pro enrollment is not open yet"
          : "Starter enrollment is not open yet",
      }, { status: 503 });
    }

    if (!(await verifiedCourseAssetsReady(selectedPlan))) {
      return NextResponse.json({ error: "Course resources are not ready for enrollment" }, { status: 503 });
    }

    const affiliateCode = friendInvite ? "" : String(
      body?.affiliateCode ?? body?.referralCode ?? ""
    ).trim().toUpperCase().slice(0, 32);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `earnwale_existing_${Date.now()}`,
      notes: {
        plan,
        affiliateCode,
        existingAccount: "true",
        userId: String(user.id),
        friendInvite: friendInvite ? "true" : "false",
        friendInviteId: friendInvite?.id ?? "",
        recipientEmail: friendInvite?.email ?? "",
        testCheckout: !friendInvite && plan === "300" && isOneRupeeTestCheckout()
          ? "one-rupee-preview" : "false",
      },
    });

    if (friendInvite) {
      await reserveFriendInvite(friendInvite.id, order.id, friendInvite.email);
    }
    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Friend invite already used or expired")) {
      return NextResponse.json({ error: "This friend invite has already started checkout or expired." }, { status: 409 });
    }
    return authErrorResponse(error);
  }
}
