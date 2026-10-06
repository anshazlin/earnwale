import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user: authUser } = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: { earnings: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const withdrawals = await prisma.withdrawal.findMany({ where: { userId: authUser.id }, orderBy: { createdAt: "desc" }, select: { id: true, amount: true, status: true, createdAt: true } });
    return NextResponse.json({ balance: user.earnings, withdrawals });
  } catch (error) { return authErrorResponse(error); }
}
