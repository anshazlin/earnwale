import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TEST_CREDIT = 250;

function isTestEmail(email: unknown) {
  return typeof email === "string" && email.toLowerCase().includes("+test@");
}

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

    if (!isTestEmail(user.email)) {
      return NextResponse.json(
        { error: "Test credit is restricted to +test accounts" },
        { status: 403 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          earnings: { increment: TEST_CREDIT },
          totalEarned: { increment: TEST_CREDIT },
          referralCount: { increment: 1 },
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: TEST_CREDIT,
          type: "CREDIT",
          description: "TEST referral reward • ₹300 plan simulation",
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      earnings: result.earnings,
      totalEarned: result.totalEarned,
      referralCount: result.referralCount,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
