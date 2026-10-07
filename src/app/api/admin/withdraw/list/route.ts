import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function GET(req: Request) {
  try {
    await requireAdmin(req);

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            earnings: true,
            upiId: true,
            bankName: true,
            accountNumber: true,
            ifscCode: true,
            payoutVerified: true,
            verifiedUpiId: true,
            payoutVerifiedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ withdrawals });
  } catch (error) { return authErrorResponse(error); }
}