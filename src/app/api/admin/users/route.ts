import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const search = url.searchParams.get("search")?.trim() ?? "";
    const skip = (page - 1) * PAGE_SIZE;

    const where = search
      ? { OR: [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ] }
      : {};

    // The Firestore compatibility layer scans a collection for findMany/count.
    // Read once, then paginate in memory to avoid doing the same scan twice.
    const matchingUsers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, plan: true, earnings: true,
        totalEarned: true, referralCount: true, referralCode: true, createdAt: true,
      },
    });

    return NextResponse.json({
      users: matchingUsers.slice(skip, skip + PAGE_SIZE),
      total: matchingUsers.length,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
