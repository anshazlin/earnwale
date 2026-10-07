import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const rows = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE + 1,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        fromUser: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      wallet: {
        earnings: user.earnings,
        totalEarned: user.totalEarned,
        referralCount: user.referralCount,
      },
      transactions: rows.slice(0, PAGE_SIZE),
      page,
      pageSize: PAGE_SIZE,
      hasMore: rows.length > PAGE_SIZE,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
