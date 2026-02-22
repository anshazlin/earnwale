import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
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

    // Basic validation
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const newReferralCode = nanoid(8);

    // Create user
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
        referredBy: referralCode || null,
      },
    });

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