"use server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";

function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const token = cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!token) return null;

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
  return decoded.userId;
}

// ✅ GET profile
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        upiId: true,
        bankName: true,
        accountNumber: true,
        ifscCode: true,
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE payout details
export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { upiId, bankName, accountNumber, ifscCode } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        upiId: upiId || null,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        ifscCode: ifscCode || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}