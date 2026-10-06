import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page");
    const search = url.searchParams.get("search")?.trim() ?? "";

    const page = Math.max(1, Number(pageParam) || 1);
    const take = PAGE_SIZE;
    const skip = (page - 1) * take;

        const where = search
      ? {
          OR: [
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          earnings: true,
          totalEarned: true,
          referralCount: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize: take,
    });
  } catch (error) { return authErrorResponse(error); }
}

