import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const COOKIE_NAME = "auth_token";
const MIN_WITHDRAWAL = 500;

export async function POST(req: Request) {
  try {
    // 🔐 Extract token
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

    // 👤 Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const amount = user.earnings;

    // 💰 Minimum withdrawal check
    if (!amount || amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ₹${MIN_WITHDRAWAL}` },
        { status: 400 }
      );
    }

    // 🚫 Prevent multiple pending withdrawals
    const existingPending = await prisma.withdrawal.findFirst({
      where: {
        userId: user.id,
        status: "pending",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request" },
        { status: 400 }
      );
    }

    // 🔄 Atomic transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1️⃣ Deduct earnings
      await tx.user.update({
        where: { id: user.id },
        data: {
          earnings: { decrement: amount },
        },
      });

      // 2️⃣ Create withdrawal record
      await tx.withdrawal.create({
        data: {
          userId: user.id,
          amount,
          status: "pending",
        },
      });

      // 3️⃣ Create transaction log (NO description)
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
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Withdrawal failed" },
      { status: 500 }
    );
  }
}