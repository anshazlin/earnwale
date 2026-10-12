import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAffiliateActive } from "@/lib/affiliate";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const latestWithdrawal = await prisma.withdrawal.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, amount: true, status: true, createdAt: true },
    });

    const affiliateActive = isAffiliateActive(user);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan ?? null,
        affiliateStatus: String(user.affiliateStatus ?? "inactive"),
        affiliateCode: affiliateActive ? user.referralCode : null,
        earnings: Number(user.earnings ?? 0),
        totalEarned: Number(user.totalEarned ?? 0),
        referralCount: Number(user.referralCount ?? 0),
      },
      latestWithdrawal,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
