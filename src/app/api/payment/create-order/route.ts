import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";
import { enrollmentFlagEnabled, verifiedCourseAssetsReady, type EnrollmentPlan } from "@/lib/course-enrollment";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";

const PLAN_AMOUNTS: Record<string, number> = {
  "300": 30000,
  "500": 50000,
};

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
    const affiliateCode = String(body?.affiliateCode ?? body?.referralCode ?? "")
      .trim()
      .toUpperCase()
      .slice(0, 32);
    const amount = PLAN_AMOUNTS[plan];

    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Enrollment must be explicitly activated for each plan. Uploading content
    // alone must never make payment available to the public.
    const selectedPlan = plan as EnrollmentPlan;
    if (!enrollmentFlagEnabled(selectedPlan)) {
      return NextResponse.json({
        error: selectedPlan === "500"
          ? "Pro enrollment is not open yet"
          : "Starter enrollment is not open yet",
      }, { status: 503 });
    }

    // Fail closed if any required private file is missing or empty. Pro
    // enrollment needs six Starter and six Pro videos plus all seven PDFs.
    if (!(await verifiedCourseAssetsReady(selectedPlan))) {
      return NextResponse.json({
        error: "Course resources are not ready for enrollment",
      }, { status: 503 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `earnwale_${Date.now()}`,
      notes: { plan, affiliateCode },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
