import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const id = "firebase-production-healthcheck";
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (existing) {
      await prisma.transaction.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true, cleaned: Boolean(existing) });
  } catch (error) {
    console.error("Firebase cleanup failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
