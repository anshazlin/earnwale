import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {

    await requireAdmin(req);

    const { withdrawalId, action } = await req.json();

    if (!["approve", "reject", "paid"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (action === "approve" || action === "paid") {
      const st = (withdrawal.status ?? "").toString().toLowerCase();
      if (st === "paid") {
        return NextResponse.json(
          { error: "Withdrawal already marked paid" },
          { status: 400 },
        );
      }
      if (st === "rejected") {
        return NextResponse.json(
          { error: "Withdrawal was rejected" },
          { status: 400 },
        );
      }
      if (st !== "pending" && st !== "approved") {
        return NextResponse.json({ error: "Invalid withdrawal state" }, { status: 400 });
      }
      const u = await prisma.user.findUnique({ where: { id: withdrawal.userId } });
      if (!u) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (u.earnings < withdrawal.amount) {
        return NextResponse.json(
          { error: "User balance is lower than this withdrawal amount" },
          { status: 400 },
        );
      }
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: { earnings: { decrement: withdrawal.amount } },
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
    }

    if (action === "reject") {
      const st = (withdrawal.status ?? "").toString().toLowerCase();
      if (st === "paid") {
        return NextResponse.json(
          { error: "Cannot reject a completed withdrawal" },
          { status: 400 },
        );
      }
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "rejected" },
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) { return authErrorResponse(error); }
}