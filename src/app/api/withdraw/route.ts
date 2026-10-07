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

    const rows = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE + 1,
      select: { id: true, amount: true, status: true, createdAt: true },
    });

    return NextResponse.json({
      balance: user.earnings,
      withdrawals: rows.slice(0, PAGE_SIZE),
      page,
      pageSize: PAGE_SIZE,
      hasMore: rows.length > PAGE_SIZE,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
