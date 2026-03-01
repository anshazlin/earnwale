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

    // ✅ Admin check
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

    await prisma.$transaction(async (tx) => {

      // ✅ APPROVE
      if (action === "approve") {
        if (withdrawal.status !== "pending") {
          throw new Error("Only pending withdrawals can be approved");
        }

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "approved" },
        });
      }
      
      if (!confirm("Have you sent the money to the user?")) return;

      // ✅ MARK AS PAID (Real deduction happens here)
      if (action === "paid") {
        if (withdrawal.status !== "approved") {
          throw new Error("Only approved withdrawals can be marked paid");
        }

        // Deduct user earnings
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            earnings: {
              decrement: withdrawal.amount,
            },
          },
        });

        // Update withdrawal status
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "paid" },
        });

        // Create DEBIT transaction record
        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "DEBIT",
          },
        });
      }

      // ✅ REJECT (refund only if already deducted earlier)
      if (action === "reject") {
        if (withdrawal.status !== "pending") {
          throw new Error("Only pending withdrawals can be rejected");
        }

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "rejected" },
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