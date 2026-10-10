import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureReferralCode(userId: string, existingCode?: string | null) {
  const current = String(existingCode ?? "").trim().toUpperCase();
  if (current) return current;

  return prisma.$transaction(async (tx: any) => {
    const latestUser = await tx.user.findUnique({ where: { id: userId } });
    const latestCode = String(latestUser?.referralCode ?? "").trim().toUpperCase();
    if (latestCode) return latestCode;

    for (let attempt = 0; attempt < 20; attempt++) {
      const code = `ERW${crypto.randomInt(10000, 100000)}`;
      const duplicate = await tx.user.findUnique({ where: { referralCode: code } });
      if (duplicate) continue;

      await tx.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });

      return code;
    }

    throw new Error("Unable to generate referral code");
  });
}

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const [latestWithdrawal, referralCode] = await Promise.all([
      prisma.withdrawal.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, amount: true, status: true, createdAt: true },
      }),
      ensureReferralCode(user.id, user.referralCode),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        referralCode,
        earnings: user.earnings,
        totalEarned: user.totalEarned,
        referralCount: user.referralCount,
      },
      latestWithdrawal,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
