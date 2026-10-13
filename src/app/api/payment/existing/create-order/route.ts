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
    const amount = checkoutAmountForPlan(plan);
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const currentPlan = String(user.plan ?? "").trim();
    if (currentPlan) {
      return NextResponse.json(
        {
          error:
            "This account already owns a course. Contact support before changing course access.",
        },
        { status: 409 },
      );
    }

    const selectedPlan = plan as EnrollmentPlan;
    if (!enrollmentFlagEnabled(selectedPlan)) {
      return NextResponse.json(
        {
          error:
            selectedPlan === "500"
              ? "Pro enrollment is not open yet"
              : "Starter enrollment is not open yet",
        },
        { status: 503 },
      );
    }

    if (!(await verifiedCourseAssetsReady(selectedPlan))) {
      return NextResponse.json(
        { error: "Course resources are not ready for enrollment" },
        { status: 503 },
      );
    }

    const affiliateCode = String(
      body?.affiliateCode ?? body?.referralCode ?? "",
    )
      .trim()
      .toUpperCase()
      .slice(0, 32);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `earnwale_existing_${Date.now()}`,
      notes: {
        plan,
        affiliateCode,
        existingAccount: "true",
        userId: String(user.id),
        testCheckout: isOneRupeeTestCheckout() ? "one-rupee-preview" : "false",
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return authErrorResponse(error);
  }
}
