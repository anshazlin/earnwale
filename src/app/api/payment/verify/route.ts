import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import razorpay from "@/lib/razorpay";
import { creditAffiliateCommission, resolveActiveAffiliate } from "@/lib/affiliate-commission";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";
import { checkoutAmountForPlan } from "@/lib/payment-amounts";
import { friendInviteFromOrder, redeemFriendInviteInTransaction } from "@/lib/friend-pro-invite";
function safeSignatureEqual(expected: string, received: unknown) {
  if (typeof received !== "string") return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  let createdFirebaseUid: string | null = null;
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const allowed = await consumeRateLimit({
      namespace: "payment-verify",
      key: clientIp(req),
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, formData } = body ?? {};
    const email = String(formData?.email ?? "").trim().toLowerCase();
    const password = String(formData?.password ?? "");
    const plan = String(formData?.plan ?? "");
    const catalogAmount = checkoutAmountForPlan(plan);

    if (!razorpay_order_id || !razorpay_payment_id || !email || !password || !catalogAmount) {
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

    const friendInvite = await friendInviteFromOrder(order, email, plan);
    const expectedAmount = friendInvite ? 100 : catalogAmount;

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

    // Attribution is bound when the server creates the Razorpay order. Ignore
    // any affiliate code supplied later by the browser during verification.
    const referralCode = friendInvite ? null :
      String(order.notes?.affiliateCode ?? "").trim().toUpperCase() || null;

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

    const firebaseUser = await firebaseAdminAuth.createUser({ email, password, emailVerified: false });
    createdFirebaseUid = firebaseUser.uid;

    await prisma.$transaction(async (tx: typeof prisma) => {
      const duplicatePayment = await tx.transaction.findUnique({ where: { id: paymentRecordId } });
      if (duplicatePayment) throw new Error("Payment already processed");

      const duplicateUser = await tx.user.findUnique({ where: { email } });
      if (duplicateUser) throw new Error("User already exists");

      // Attribution never decides whether a paid customer receives the course.
      // Invalid, inactive or self affiliate codes simply do not earn commission.
      const referrer = friendInvite ? null : await resolveActiveAffiliate(tx, referralCode, { email });
      const createdUser = await tx.user.create({
        data: {
          name: email.split("@")[0] || "Member",
          email,
          firebaseUid: firebaseUser.uid,
          password: hashedPassword,
          plan,
          referralCode: null,
          referredBy: referrer ? referrer.referralCode : null,
          affiliateStatus: "inactive",
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
          testCheckout: String(order.notes?.testCheckout ?? "") === "one-rupee-preview",
          friendDiscount: Boolean(friendInvite),
          friendInviteId: friendInvite?.id ?? null,
        },
      });

      if (friendInvite) {
        await redeemFriendInviteInTransaction(tx, friendInvite, razorpay_order_id, createdUser.id);
      }

      if (referrer) {
        await creditAffiliateCommission(tx, {
          affiliate: referrer,
          buyerUserId: createdUser.id,
          plan,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
        });

        await tx.user.update({
          where: { id: createdUser.id },
          data: { hasReceivedReward: true },
        });
      }

      return createdUser;
    });

    return NextResponse.json({ success: true, verificationRequired: true });
  } catch (error: unknown) {
    if (createdFirebaseUid) {
      try {
        const linked = await prisma.user.findUnique({ where: { firebaseUid: createdFirebaseUid } });
        if (!linked) await firebaseAdminAuth.deleteUser(createdFirebaseUid);
      } catch {}
    }
    const message = error instanceof Error ? error.message : "Payment verification failed";
    const expectedClientError =
      message === "Payment already processed" ||
      message === "User already exists" ||
      message === "Friend invitation already redeemed" ||
      message.includes("Friend invitation already used") ||
      message.includes("Friend checkout does not match");

    if (!expectedClientError) console.error("Payment verification failed", error);
    return NextResponse.json(
      { error: expectedClientError ? message : "Payment verification failed" },
      { status: expectedClientError ? 409 : 500 }
    );
  }
}
