import { NextResponse } from "next/server";
import crypto from "crypto";
import razorpay from "@/lib/razorpay";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  creditAffiliateCommission,
  resolveActiveAffiliate,
} from "@/lib/affiliate-commission";
import { isSameOriginRequest } from "@/lib/request-security";

const PLAN_AMOUNTS: Record<string, number> = {
  "300": 30000,
  "500": 50000,
};

function safeSignatureEqual(expected: string, received: unknown) {
  if (typeof received !== "string") return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const { user: authenticatedUser } = await requireAuth(req);
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan: rawPlan,
    } = body ?? {};

    const plan = String(rawPlan ?? "");
    const expectedAmount = PLAN_AMOUNTS[plan];
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !expectedAmount
    ) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 },
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Payment configuration is missing");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeSignatureEqual(expectedSignature, razorpay_signature)) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
    ]);

    if (
      String(payment.order_id) !== razorpay_order_id ||
      Number(order.amount) !== expectedAmount ||
      String(order.currency).toUpperCase() !== "INR" ||
      Number(payment.amount) !== expectedAmount ||
      String(payment.currency).toUpperCase() !== "INR" ||
      !["authorized", "captured"].includes(String(payment.status))
    ) {
      return NextResponse.json(
        { error: "Payment does not match selected plan" },
        { status: 400 },
      );
    }

    if (
      String(order.notes?.plan ?? "") !== plan ||
      String(order.notes?.existingAccount ?? "") !== "true" ||
      String(order.notes?.userId ?? "") !== String(authenticatedUser.id)
    ) {
      return NextResponse.json(
        { error: "Order account or plan mismatch" },
        { status: 400 },
      );
    }

    const affiliateCode =
      String(order.notes?.affiliateCode ?? "").trim().toUpperCase() || null;
    const paymentRecordId = `payment_${razorpay_payment_id}`;

    await prisma.$transaction(async (tx: any) => {
      const duplicatePayment = await tx.transaction.findUnique({
        where: { id: paymentRecordId },
      });
      if (duplicatePayment) throw new Error("Payment already processed");

      const user = await tx.user.findUnique({
        where: { id: authenticatedUser.id },
      });
      if (!user) throw new Error("Account record not found");

      if (String(user.plan ?? "").trim()) {
        throw new Error("Course access already exists");
      }

      const affiliate = await resolveActiveAffiliate(
        tx,
        affiliateCode,
        {
          id: user.id,
          email: user.email,
        },
      );

      await tx.user.update({
        where: { id: user.id },
        data: {
          plan,
          referredBy: affiliate ? affiliate.referralCode : null,
          hasReceivedReward: Boolean(affiliate),
        },
      });

      await tx.transaction.create({
        data: {
          id: paymentRecordId,
          userId: user.id,
          amount: expectedAmount / 100,
          type: "PAYMENT",
          fromUser: razorpay_order_id,
          sourcePaymentId: razorpay_payment_id,
          sourceOrderId: razorpay_order_id,
          sourcePlan: plan,
        },
      });

      if (affiliate) {
        await creditAffiliateCommission(tx, {
          affiliate,
          buyerUserId: user.id,
          plan,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
        });
      }
    });

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error: any) {
    const message = String(error?.message ?? "");
    if (
      message === "Payment already processed" ||
      message === "Course access already exists"
    ) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message === "Account record not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      error?.name === "AuthError" ||
      message === "Unauthorized" ||
      message === "Invalid or expired session" ||
      message === "Email verification required"
    ) {
      return authErrorResponse(error);
    }

    console.error("Existing-account payment verification failed", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
