import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import razorpay from "@/lib/razorpay";

const COOKIE_NAME = "auth_token";
const MAX_AGE_DAYS = 7;
const MAX_AGE_SECONDS = MAX_AGE_DAYS * 24 * 60 * 60;
const PLAN_AMOUNTS: Record<string, number> = {
  "300": 30000,
  "500": 50000,
};
const PLAN_REWARDS: Record<string, number> = {
  "300": 250,
  "500": 450,
};

function safeSignatureEqual(expected: string, received: unknown) {
  if (typeof received !== "string") return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = body ?? {};
    const email = String(formData?.email ?? "").trim().toLowerCase();
    const password = String(formData?.password ?? "");
    const plan = String(formData?.plan ?? "");
    const referralCode = String(formData?.referralCode ?? "").trim().toUpperCase() || null;
    const expectedAmount = PLAN_AMOUNTS[plan];

    if (!razorpay_order_id || !razorpay_payment_id || !email || !password || !expectedAmount) {
      return NextResponse.json({ error: "Invalid signup or payment data" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Payment configuration is missing");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeSignatureEqual(expectedSignature, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
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
      return NextResponse.json({ error: "Payment does not match selected plan" }, { status: 400 });
    }

    if (order.notes?.plan && String(order.notes.plan) !== plan) {
      return NextResponse.json({ error: "Order plan mismatch" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const paymentRecordId = `payment_${razorpay_payment_id}`;
    const alreadyProcessed = await prisma.transaction.findUnique({ where: { id: paymentRecordId } });
    if (alreadyProcessed) {
      return NextResponse.json({ error: "Payment already processed" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    async function generateUniqueReferralCode(tx: any) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const code = `ERW${crypto.randomInt(10000, 100000)}`;
        const existing = await tx.user.findUnique({ where: { referralCode: code } });
        if (!existing) return code;
      }
      throw new Error("Unable to generate referral code");
    }

    const newUser = await prisma.$transaction(async (tx: any) => {
      const duplicatePayment = await tx.transaction.findUnique({ where: { id: paymentRecordId } });
      if (duplicatePayment) throw new Error("Payment already processed");

      const duplicateUser = await tx.user.findUnique({ where: { email } });
      if (duplicateUser) throw new Error("User already exists");

      let referrer = null;
      if (referralCode) {
        referrer = await tx.user.findUnique({ where: { referralCode } });
        if (!referrer) throw new Error("Invalid referral code");
        if (String(referrer.email).toLowerCase() === email) {
          throw new Error("Self referral not allowed");
        }
      }

      const myReferralCode = await generateUniqueReferralCode(tx);
      const createdUser = await tx.user.create({
        data: {
          name: email.split("@")[0] || "Member",
          email,
          password: hashedPassword,
          plan,
          referralCode: myReferralCode,
          referredBy: referrer ? referrer.referralCode : null,
          earnings: 0,
          totalEarned: 0,
          referralCount: 0,
          hasReceivedReward: false,
        },
      });

      await tx.transaction.create({
        data: {
          id: paymentRecordId,
          userId: createdUser.id,
          amount: expectedAmount / 100,
          type: "PAYMENT",
          fromUser: razorpay_order_id,
        },
      });

      const rewardAmount = PLAN_REWARDS[plan] ?? 0;
      if (referrer && rewardAmount > 0) {
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            earnings: { increment: rewardAmount },
            totalEarned: { increment: rewardAmount },
            referralCount: { increment: 1 },
          },
        });

        await tx.transaction.create({
          data: {
            userId: referrer.id,
            amount: rewardAmount,
            type: "CREDIT",
            fromUser: createdUser.id,
          },
        });

        await tx.user.update({
          where: { id: createdUser.id },
          data: { hasReceivedReward: true },
        });
      }

      return createdUser;
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("Authentication configuration is missing");

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: `${MAX_AGE_DAYS}d` }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SECONDS,
      path: "/",
    });
    return response;
  } catch (error: any) {
    const message = error?.message || "Payment verification failed";
    const expectedClientError =
      message === "Payment already processed" ||
      message === "User already exists" ||
      message === "Invalid referral code" ||
      message === "Self referral not allowed";

    if (!expectedClientError) console.error("Payment verification failed", error);
    return NextResponse.json(
      { error: expectedClientError ? message : "Payment verification failed" },
      { status: expectedClientError ? 409 : 500 }
    );
  }
}
