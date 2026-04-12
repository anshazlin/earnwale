import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";

/**
 * POST body: { id: string, status: "Paid" | "Rejected" }
 * Paid: only from pending (or legacy "approved"), decrements user earnings, withdrawal → paid, ledger DEBIT.
 * Rejected: sets withdrawal to rejected (no balance change).
 */
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email?: string;
    };

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id: withdrawalId, status } = await req.json();

    if (!withdrawalId || typeof withdrawalId !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const normalized = (status ?? "").toString().trim().toLowerCase();

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    const wStatus = (withdrawal.status ?? "").toString().toLowerCase();

    if (normalized === "rejected") {
      if (wStatus === "paid") {
        return NextResponse.json(
          { error: "Cannot reject a completed withdrawal" },
          { status: 400 },
        );
      }
      if (wStatus === "rejected") {
        return NextResponse.json({ success: true });
      }
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "rejected" },
      });
      return NextResponse.json({ success: true });
    }

    if (normalized === "paid") {
      if (wStatus === "paid") {
        return NextResponse.json(
          { error: "Withdrawal already marked paid" },
          { status: 400 },
        );
      }
      if (wStatus === "rejected") {
        return NextResponse.json(
          { error: "Withdrawal was rejected" },
          { status: 400 },
        );
      }
      if (wStatus !== "pending" && wStatus !== "approved") {
        return NextResponse.json({ error: "Invalid withdrawal state" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: withdrawal.userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (user.earnings < withdrawal.amount) {
        return NextResponse.json(
          { error: "User balance is lower than this withdrawal amount" },
          { status: 400 },
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            earnings: {
              decrement: withdrawal.amount,
            },
          },
        });

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "paid" },
        });

        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "DEBIT",
          },
        });
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
