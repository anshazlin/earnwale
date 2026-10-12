import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAffiliateActive } from "@/lib/affiliate";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const skip = (page - 1) * PAGE_SIZE;

    const active = isAffiliateActive(user);
    const rows = active
      ? await prisma.user.findMany({
          where: { referredBy: user.referralCode },
          orderBy: { createdAt: "desc" },
          skip,
          take: PAGE_SIZE + 1,
          select: { id: true, name: true, plan: true, createdAt: true },
        })
      : [];

    return NextResponse.json({
      affiliateStatus: user.affiliateStatus ?? "inactive",
      affiliateCode: active ? user.referralCode : null,
      qualifyingSales: Number(user.referralCount ?? 0),
      lifetimeCommission: Number(user.totalEarned ?? 0),
      // Legacy aliases retained for older clients during migration.
      referralCode: active ? user.referralCode : null,
      referralCount: Number(user.referralCount ?? 0),
      totalEarned: Number(user.totalEarned ?? 0),
      referrals: rows.slice(0, PAGE_SIZE),
      page,
      pageSize: PAGE_SIZE,
      hasMore: rows.length > PAGE_SIZE,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
