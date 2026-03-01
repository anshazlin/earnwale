import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const MIN_WITHDRAWAL = 500;
const MAX_WITHDRAWAL = 5000;

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amount = user.earnings;

    // 🔐 Must have payout details
    if (!user.upiId && !user.accountNumber) {
      return NextResponse.json(
        { error: "Please add payout details first" },
        { status: 400 }
      );
    }

    // Minimum check
    if (!amount || amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    // Maximum check
    if (amount > MAX_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Maximum withdrawal per request is ₹${MAX_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    // Prevent pending
    const existingPending = await prisma.withdrawal.findFirst({
      where: {
        userId: user.id,
        status: "pending",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal" },
        { status: 400 }
      );
    }

    // 24 hour rule
    const lastWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastWithdrawal) {
      const diff =
        Date.now() - new Date(lastWithdrawal.createdAt).getTime();
      const hours = diff / (1000 * 60 * 60);

      if (hours < 24) {
        return NextResponse.json(
          { error: "You can withdraw only once every 24 hours" },
          { status: 400 }
        );
      }
    }

    // ✅ ONLY create withdrawal (NO deduction here)
    await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Withdrawal failed" },
      { status: 500 }
    );
  }
}