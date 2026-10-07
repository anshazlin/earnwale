import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page");
    const typeParam = url.searchParams.get("type");

    const page = Math.max(1, Number(pageParam) || 1);
    const take = PAGE_SIZE;
    const skip = (page - 1) * take;

    const normalizedType = (typeParam ?? "").toString().toUpperCase();
    const where =
      normalizedType === "CREDIT" || normalizedType === "DEBIT"
        ? { type: normalizedType }
        : {};

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          type: true,
          amount: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      pageSize: take,
    });
  } catch (error) { return authErrorResponse(error); }
}

