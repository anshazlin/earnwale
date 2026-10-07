import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Manual payout workflow.
 * POST body:
 * - Paid: { id, status: "Paid", paymentReference, adminNote? }
 * - Rejected: { id, status: "Rejected", adminNote? }
 *
 * Paid is only allowed from pending/approved. The user's available earnings are
 * decremented only when the admin confirms the external UPI/bank transfer.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const withdrawalId = body?.id;
    const normalized = String(body?.status ?? "").trim().toLowerCase();
    const paymentReference = String(body?.paymentReference ?? "").trim();
    const adminNote = String(body?.adminNote ?? "").trim().slice(0, 300);

    if (!withdrawalId || typeof withdrawalId !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    const wStatus = String(withdrawal.status ?? "").toLowerCase();

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
        data: {
          status: "rejected",
          ...(adminNote ? { adminNote } : {}),
          reviewedAt: new Date(),
        },
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
        return NextResponse.json(
          { error: "Invalid withdrawal state" },
          { status: 400 },
        );
      }

      if (paymentReference.length < 3 || paymentReference.length > 100) {
        return NextResponse.json(
          { error: "Enter the UTR / payment reference before marking paid" },
          { status: 400 },
        );
      }

      const duplicateReference = await prisma.withdrawal.findFirst({
        where: { paymentReference },
      });
      if (duplicateReference && duplicateReference.id !== withdrawalId) {
        return NextResponse.json(
          { error: "This payment reference is already used for another withdrawal" },
          { status: 409 },
        );
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

      const paidAt = new Date();
      const payoutUpiId = String(withdrawal.payoutUpiId ?? "").trim().toLowerCase();
      const currentUpiId = String(user.upiId ?? "").trim().toLowerCase();
      const shouldBindPayout = Boolean(payoutUpiId && currentUpiId === payoutUpiId);

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            earnings: {
              decrement: withdrawal.amount,
            },
            ...(shouldBindPayout
              ? {
                  payoutVerified: true,
                  verifiedUpiId: payoutUpiId,
                  payoutVerifiedAt: paidAt,
                  payoutVerificationReference: paymentReference,
                  payoutChangeAvailableAt: null,
                }
              : {}),
          },
        });

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "paid",
            paymentReference,
            paidAt,
            reviewedAt: paidAt,
            ...(adminNote ? { adminNote } : {}),
          },
        });

        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "DEBIT",
            description: `Withdrawal paid • Ref ${paymentReference}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        paymentReference,
        paidAt: paidAt.toISOString(),
        payoutBound: shouldBindPayout,
      });
    }

    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
