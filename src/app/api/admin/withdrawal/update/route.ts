import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";

/**
 * POST body: { id: string, status: "Paid" | "Rejected" }
 * "Paid" maps to approving a pending withdrawal (status → approved).
 * "Rejected" maps to rejection (status → rejected).
 */
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

    const decoded: { email?: string } = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as { email?: string };

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id: withdrawalId, status } = await req.json();

    if (!withdrawalId || typeof withdrawalId !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const normalized = (status ?? "").toString().trim().toLowerCase();
    let action: "approve" | "reject" | null = null;
    if (normalized === "rejected") action = "reject";
    else if (normalized === "paid") action = "approve";

    if (!action) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
