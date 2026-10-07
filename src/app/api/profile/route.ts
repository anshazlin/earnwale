import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPI_PATTERN = /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i;

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    return NextResponse.json({
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      ifscCode: user.ifscCode,
      payoutVerified: Boolean(user.payoutVerified),
      payoutVerifiedAt: user.payoutVerifiedAt ?? null,
      payoutVerifiedReference: user.payoutVerifiedReference ?? null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const { name, upiId, bankName, accountNumber, ifscCode } = await req.json();

    const data: Record<string, unknown> = {};

    if (typeof name === "string" && name.trim()) {
      data.name = name.trim();
    }

    if (typeof upiId === "string") {
      const currentUpi = String(user.upiId ?? "").trim().toLowerCase();
      const nextUpi = upiId.trim().toLowerCase();

      if (!nextUpi || !UPI_PATTERN.test(nextUpi)) {
        return NextResponse.json(
          { error: "Enter a valid UPI ID" },
          { status: 400 },
        );
      }

      if (Boolean(user.payoutVerified) && nextUpi !== currentUpi) {
        return NextResponse.json(
          {
            error:
              "Your verified payout UPI is locked. Contact support if you need to change it.",
          },
          { status: 409 },
        );
      }

      if (!user.payoutVerified && nextUpi !== currentUpi) {
        const openWithdrawal = await prisma.withdrawal.findFirst({
          where: {
            userId: user.id,
            status: { in: ["pending", "approved"] },
          },
        });

        if (openWithdrawal) {
          return NextResponse.json(
            {
              error:
                "You cannot change your UPI while a withdrawal is in progress.",
            },
            { status: 409 },
          );
        }
      }

      data.upiId = nextUpi;

      if (!user.payoutVerified) {
        data.payoutVerified = false;
        data.payoutVerifiedAt = null;
        data.payoutVerifiedReference = null;
      }
    }

    if (bankName !== undefined) data.bankName = bankName || null;
    if (accountNumber !== undefined) data.accountNumber = accountNumber || null;
    if (ifscCode !== undefined) data.ifscCode = ifscCode || null;

    await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      success: true,
      payoutVerified: Boolean(user.payoutVerified),
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
