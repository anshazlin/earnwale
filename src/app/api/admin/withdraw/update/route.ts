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

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { withdrawalId, action } = await req.json();

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (action === "approve") {

      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "approved" },
      });

    }

    if (action === "reject") {

      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "rejected" },
      });

    }

    if (action === "paid") {

      await prisma.$transaction(async (tx) => {

        await tx.user.update({
          where: { id: withdrawal.userId },
          data: {
            earnings: {
              decrement: withdrawal.amount
            }
          }
        });

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "paid" }
        });

        await tx.transaction.create({
          data: {
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            type: "DEBIT"
          }
        });

      });

    }

    return NextResponse.json({ success: true });

  } catch (error:any) {

    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    );

  }
}