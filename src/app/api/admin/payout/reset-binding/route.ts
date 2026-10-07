import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const { userId } = await req.json();
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const openWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId,
        status: { in: ["pending", "approved"] },
      },
    });

    if (openWithdrawal) {
      return NextResponse.json(
        { error: "Finish or reject the pending withdrawal before resetting the payout binding." },
        { status: 409 },
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        payoutVerified: false,
        payoutVerifiedAt: null,
        payoutVerifiedReference: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
