import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const id = "firebase-production-healthcheck";
    const existing = await prisma.transaction.findUnique({ where: { id } });

    if (existing) {
      await prisma.transaction.update({
        where: { id },
        data: { type: "HEALTHCHECK", amount: 0, fromUser: "production-verification" },
      });
    } else {
      await prisma.transaction.create({
        data: {
          id,
          userId: "system-healthcheck",
          type: "HEALTHCHECK",
          amount: 0,
          fromUser: "production-verification",
        },
      });
    }

    const verified = await prisma.transaction.findUnique({ where: { id } });
    return NextResponse.json({
      ok: Boolean(verified && verified.type === "HEALTHCHECK" && verified.amount === 0),
      database: "firestore",
    });
  } catch (error) {
    console.error("Firebase production health check failed", error);
    return NextResponse.json({ ok: false, database: "firestore" }, { status: 503 });
  }
}
