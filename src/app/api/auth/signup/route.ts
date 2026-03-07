import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      mobile,
      state,
      dob,
      password,
      referralCode,
      plan,
    } = body;

    if (!name || !email || !password || !plan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (plan !== "300" && plan !== "500") {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔐 Validate Referral Code
    let referrerUser = null;

    if (referralCode) {
      referrerUser = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referrerUser) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 400 }
        );
      }

      // Prevent self referral
      if (referrerUser.email === normalizedEmail) {
        return NextResponse.json(
          { error: "Self-referral not allowed" },
          { status: 400 }
        );
      }
    }

    // Generate Unique Referral Code
    async function generateUniqueReferralCode() {
      let isUnique = false;
      let code = "";

      while (!isUnique) {
        const random = Math.floor(10000 + Math.random() * 90000);
        code = `ERW${random}`;

        const existing = await prisma.user.findUnique({
          where: { referralCode: code },
        });

        if (!existing) {
          isUnique = true;
        }
      }

      return code;
    }

    const newReferralCode = await generateUniqueReferralCode();

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        mobile,
        state,
        dob,
        password: hashedPassword,
        plan,
        referralCode: newReferralCode,
        referredBy: referrerUser ? referrerUser.id : null,
      },
    });

    // Increment referral count
    if (referrerUser) {
      await prisma.user.update({
        where: { id: referrerUser.id },
        data: {
          referralCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}