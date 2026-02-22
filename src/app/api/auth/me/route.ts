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

    const tokenMatch = cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));

    if (!tokenMatch) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = tokenMatch.split("=")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        referralCode: true,
        earnings: true,
        totalEarned: true,
        referralCount: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}