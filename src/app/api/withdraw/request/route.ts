import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const MIN_WITHDRAWAL = 450;
const MAX_WITHDRAWAL = 4500;

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

    if (user.earnings < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Insufficient balance (minimum withdrawal is ₹${MIN_WITHDRAWAL})` },
        { status: 400 },
      );
    }

    const amount = Math.min(user.earnings, MAX_WITHDRAWAL);

    if (user.earnings < amount) {
      return NextResponse.json(
        { error: "Insufficient balance for this withdrawal" },
        { status: 400 },
      );
    }

    if (!user.upiId && !user.accountNumber) {
      return NextResponse.json(
        { error: "Please add payout details first" },
        { status: 400 }
      );
    }

    if (!amount || amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    if (amount > MAX_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Maximum withdrawal per request is ₹${MAX_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    const existingPending = await prisma.withdrawal.findFirst({
      where: {
        userId: user.id,
        status: { in: ["pending", "approved"] },
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal" },
        { status: 400 }
      );
    }

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

    await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount: amount,
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