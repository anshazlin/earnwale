import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_WITHDRAWAL = 450;
const MAX_WITHDRAWAL = 4500;

export async function POST(req: Request) {
  try {
    const { user: authenticatedUser } = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { id: authenticatedUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.earnings < MIN_WITHDRAWAL) return NextResponse.json({ error: `Insufficient balance (minimum withdrawal is ₹${MIN_WITHDRAWAL})` }, { status: 400 });
    const amount = Math.min(user.earnings, MAX_WITHDRAWAL);
    if (!user.upiId && !user.accountNumber) return NextResponse.json({ error: "Please add payout details first" }, { status: 400 });
    const existingPending = await prisma.withdrawal.findFirst({ where: { userId: user.id, status: { in: ["pending", "approved"] } } });
    if (existingPending) return NextResponse.json({ error: "You already have a pending withdrawal" }, { status: 400 });
    const lastWithdrawal = await prisma.withdrawal.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (lastWithdrawal && (Date.now() - new Date(lastWithdrawal.createdAt).getTime()) / 3600000 < 24) {
      return NextResponse.json({ error: "You can withdraw only once every 24 hours" }, { status: 400 });
    }
    await prisma.withdrawal.create({ data: {\n      userId: user.id,\n      amount,\n      status: "pending",\n      payoutUpiId: user.upiId || null,\n      payoutName: user.name || null,\n      payoutMethod: user.upiId ? "upi" : "bank",\n    } });
    return NextResponse.json({ success: true });
  } catch (error) { return authErrorResponse(error); }
}
