import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeUpi(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    return NextResponse.json({
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      ifscCode: user.ifscCode,
      payoutVerified: Boolean(user.payoutVerified),
      verifiedUpiId: user.verifiedUpiId ?? null,
      payoutVerifiedAt: user.payoutVerifiedAt ?? null,
      payoutChangeAvailableAt: user.payoutChangeAvailableAt ?? null,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const { user: authenticatedUser } = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { id: authenticatedUser.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, upiId, bankName, accountNumber, ifscCode } = await req.json();
    const nextUpiId = upiId === null ? null : normalizeUpi(upiId);
    const currentUpiId = normalizeUpi(user.upiId);
    const verifiedUpiId = normalizeUpi(user.verifiedUpiId);
    const payoutVerified =
      Boolean(user.payoutVerified) &&
      Boolean(verifiedUpiId) &&
      verifiedUpiId === currentUpiId;

    if (
      payoutVerified &&
      nextUpiId !== null &&
      nextUpiId !== verifiedUpiId
    ) {
      return NextResponse.json(
        {
          error:
            "Your verified payout account is locked. Use Change payout account and confirm your password first.",
        },
        { status: 423 },
      );
    }

    if (nextUpiId && !/^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(nextUpiId)) {
      return NextResponse.json({ error: "Invalid UPI ID format" }, { status: 400 });
    }

    const upiChanged = nextUpiId !== null && nextUpiId !== currentUpiId;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(upiId !== undefined ? { upiId: nextUpiId || null } : {}),
        ...(bankName !== undefined ? { bankName: bankName || null } : {}),
        ...(accountNumber !== undefined ? { accountNumber: accountNumber || null } : {}),
        ...(ifscCode !== undefined ? { ifscCode: ifscCode || null } : {}),
        ...(upiChanged
          ? {
              payoutVerified: false,
              verifiedUpiId: null,
              payoutVerifiedAt: null,
              payoutVerificationReference: null,
            }
          : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
