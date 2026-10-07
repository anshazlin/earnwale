import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

const RECENT_AUTH_SECONDS = 5 * 60;
const PAYOUT_CHANGE_HOLD_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { decoded: sessionUser, user: authenticatedUser } = await requireAuth(req);
    const { idToken } = await req.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Password confirmation required" },
        { status: 400 },
      );
    }

    const verified = await firebaseAdminAuth.verifyIdToken(idToken, true);

    if (verified.uid !== sessionUser.uid) {
      return NextResponse.json({ error: "Account mismatch" }, { status: 403 });
    }
    if (!verified.email_verified) {
      return NextResponse.json(
        { error: "Email verification required" },
        { status: 403 },
      );
    }

    const authTime = Number(verified.auth_time ?? 0);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!authTime || nowSeconds - authTime > RECENT_AUTH_SECONDS) {
      return NextResponse.json(
        { error: "Please confirm your password again" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: authenticatedUser.id },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: user.id,
        status: { in: ["pending", "approved"] },
      },
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        {
          error:
            "Your payout account cannot be changed while a withdrawal is in progress.",
        },
        { status: 409 },
      );
    }

    const now = new Date();
    const holdUntil = new Date(now.getTime() + PAYOUT_CHANGE_HOLD_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        upiId: null,
        payoutVerified: false,
        verifiedUpiId: null,
        payoutVerifiedAt: null,
        payoutVerificationReference: null,
        payoutResetAt: now,
        payoutChangeAvailableAt: holdUntil,
      },
    });

    return NextResponse.json({
      success: true,
      holdUntil: holdUntil.toISOString(),
    });
  } catch (error: any) {
    if (String(error?.code ?? "").startsWith("auth/")) {
      return NextResponse.json(
        { error: "Password confirmation failed" },
        { status: 401 },
      );
    }
    return authErrorResponse(error);
  }
}
