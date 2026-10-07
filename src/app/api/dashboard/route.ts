import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
      },
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
      transactions,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
