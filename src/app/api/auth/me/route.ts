import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user: authenticatedUser } = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { id: authenticatedUser.id }, select: {
      id: true, name: true, email: true, plan: true, referralCode: true,
      earnings: true, totalEarned: true, referralCount: true,
    }});
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (error) { return authErrorResponse(error); }
}
