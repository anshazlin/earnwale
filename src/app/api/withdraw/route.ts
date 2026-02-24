import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      earnings: user.earnings,
      totalEarned: user.totalEarned,
      referralCount: user.referralCount,
      transactions: user.transactions,
      withdrawals: user.withdrawals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}