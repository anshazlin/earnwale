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
      select: {
        earnings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      balance: user.earnings,
      withdrawals,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}