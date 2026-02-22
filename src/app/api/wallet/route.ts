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

    const transactions = await prisma.transaction.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}