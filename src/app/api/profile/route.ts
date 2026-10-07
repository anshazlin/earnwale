import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user: authUser } = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: {
      name: true, email: true, upiId: true, bankName: true, accountNumber: true, ifscCode: true,
    }});
    return NextResponse.json(user);
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const { name, upiId, bankName, accountNumber, ifscCode } = await req.json();
    await prisma.user.update({ where: { id: user.id }, data: {
      ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
      upiId: upiId || null, bankName: bankName || null, accountNumber: accountNumber || null, ifscCode: ifscCode || null,
    }});
    return NextResponse.json({ success: true });
  } catch (error) { return authErrorResponse(error); }
}
