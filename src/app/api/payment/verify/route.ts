import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const MAX_AGE_DAYS = 7;
const MAX_AGE_SECONDS = MAX_AGE_DAYS * 24 * 60 * 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData,
    } = body;

    const {
      name,
      email,
      password,
      plan,
      referralCode,
    } = formData;

    // 🔐 Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // 🚫 Prevent duplicate user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const myReferralCode = nanoid(8);

    // 🎯 Transaction-safe DB operations
    const newUser = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        let referrer = null;

        if (referralCode) {
          referrer = await tx.user.findUnique({
            where: { referralCode },
          });

          if (referrer && referrer.email === email) {
            throw new Error("Self referral not allowed");
          }
        }

        // 🎁 Calculate reward
        let rewardAmount = 0;
        if (plan === "300") rewardAmount = 250;
        if (plan === "500") rewardAmount = 450;

        // 👤 Create user
        const createdUser = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            plan,
            referralCode: myReferralCode,
            earnings: 0,
            totalEarned: 0,
          },
        });

        // 💰 Reward referrer
        if (referrer && rewardAmount > 0) {
          await tx.user.update({
            where: { id: referrer.id },
            data: {
              earnings: { increment: rewardAmount },
              totalEarned: { increment: rewardAmount },
            },
          });

          await tx.transaction.create({
            data: {
              userId: referrer.id,
              amount: rewardAmount,
              type: "REFERRAL_REWARD",
            },
          });
        }

        return createdUser;
      }
    );

    // 🔑 Generate JWT
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!,
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
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}