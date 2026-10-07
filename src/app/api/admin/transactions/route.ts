import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const normalizedType = (url.searchParams.get("type") ?? "").toUpperCase();
    const where =
      normalizedType === "CREDIT" || normalizedType === "DEBIT"
        ? { type: normalizedType }
        : {};
    const skip = (page - 1) * PAGE_SIZE;

    // One transaction scan per request. Resolve users only for the visible page.
    const matching = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, type: true, amount: true, createdAt: true, userId: true,
      },
    });
    const pageRows = matching.slice(skip, skip + PAGE_SIZE);
    const transactions = await Promise.all(
      pageRows.map(async (row: any) => ({
        ...row,
        user: row.userId
          ? await prisma.user.findUnique({
              where: { id: row.userId },
              select: { name: true, email: true },
            })
          : null,
      })),
    );

    return NextResponse.json({
      transactions,
      total: matching.length,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
