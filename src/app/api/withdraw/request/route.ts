import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";

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

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.earnings < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.user.update({
        where: { id: user.id },
        data: {
          earnings: { decrement: amount },
        },
      });

      // Create withdrawal request
      await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          status: "pending",
        },
      });

      // Create debit transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount,
          type: "DEBIT",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Withdrawal failed" },
      { status: 500 }
    );
  }
}