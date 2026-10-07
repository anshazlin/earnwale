import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const latestWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, amount: true, status: true, createdAt: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        referralCode: user.referralCode,
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
