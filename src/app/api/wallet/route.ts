import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user: authUser } = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { earnings: true, totalEarned: true, referralCount: true } });
    const transactions = await prisma.transaction.findMany({ where: { userId: authUser.id }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ wallet: user, transactions });
  } catch (error) { return authErrorResponse(error); }
}
