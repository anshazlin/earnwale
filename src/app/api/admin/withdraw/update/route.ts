import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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

    // 🔐 Check admin
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { withdrawalId, action } = await req.json();
    // action: "approve" | "reject" | "paid"

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending" && action !== "paid") {
      return NextResponse.json(
        { error: "Already processed" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (action === "approve") {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "approved" },
        });
      }

      if (action === "paid") {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "paid" },
        });
      }

      if (action === "reject") {
        // refund user balance
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            earnings: { increment: withdrawal.amount },
          },
        });

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "rejected" },
        });

        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "CREDIT",
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    );
  }
}