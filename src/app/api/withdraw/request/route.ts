import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const MIN_WITHDRAW = 500;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.earnings < MIN_WITHDRAW) {
      return NextResponse.json(
        { error: "Minimum withdrawal is ₹500" },
        { status: 400 }
      );
    }

    await prisma.withdrawRequest.create({
      data: {
        userId: user.id,
        amount: user.earnings,
        status: "PENDING",
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { earnings: 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Withdrawal failed" },
      { status: 500 }
    );
  }
}