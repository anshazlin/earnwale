import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";

export async function POST(req: Request) {
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

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!admin || admin.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { withdrawalId, action } = await req.json();

    if (!withdrawalId || !action) {
      return NextResponse.json(
        { error: "Missing withdrawalId or action" },
        { status: 400 }
      );
    }

    if (!["approved", "paid", "rejected"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: action },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Admin update failed" },
      { status: 500 }
    );
  }
}