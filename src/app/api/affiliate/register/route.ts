import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { AFFILIATE_TERMS_VERSION } from "@/lib/affiliate";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";

const RECENT_AUTH_SECONDS = 5 * 60;

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const allowed = await consumeRateLimit({
      namespace: "affiliate-register",
      key: clientIp(req),
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 },
      );
    }

    const { idToken, acceptTerms } = await req.json();
    if (acceptTerms !== true) {
      return NextResponse.json(
        { error: "Affiliate Terms must be accepted" },
        { status: 400 },
      );
    }
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "ID token required" }, { status: 400 });
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(idToken, true);
    const authAgeSeconds =
      Math.floor(Date.now() / 1000) - Number(decoded.auth_time ?? 0);
    if (!decoded.auth_time || authAgeSeconds > RECENT_AUTH_SECONDS) {
      return NextResponse.json(
        { error: "Recent sign-up required" },
        { status: 401 },
      );
    }

    const email = String(decoded.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Email account required" },
        { status: 400 },
      );
    }

    const byUid = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });
    const byEmail = await prisma.user.findUnique({ where: { email } });
    const existing = byUid ?? byEmail;

    if (existing) {
      if (
        existing.firebaseUid &&
        String(existing.firebaseUid) !== decoded.uid
      ) {
        return NextResponse.json(
          { error: "Account association conflict" },
          { status: 409 },
        );
      }

      const status = String(existing.affiliateStatus ?? "inactive").toLowerCase();
      if (status === "pending_verification" || status === "active") {
        return NextResponse.json({
          success: true,
          status,
          verificationRequired: !decoded.email_verified,
        });
      }

      return NextResponse.json(
        {
          error:
            "An Earnwale account already exists for this email. Sign in and join the Affiliate Program from your dashboard.",
        },
        { status: 409 },
      );
    }

    await prisma.user.create({
      data: {
        id: decoded.uid,
        firebaseUid: decoded.uid,
        email,
        name: email.split("@")[0] || "Member",
        plan: null,
        referralCode: null,
        referredBy: null,
        earnings: 0,
        totalEarned: 0,
        referralCount: 0,
        affiliateStatus: "pending_verification",
        affiliateTermsVersion: AFFILIATE_TERMS_VERSION,
        affiliateTermsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      status: "pending_verification",
      verificationRequired: true,
    });
  } catch (error: any) {
    if (String(error?.code ?? "").startsWith("auth/")) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 },
      );
    }
    console.error("Affiliate registration failed", error);
    return NextResponse.json(
      { error: "Unable to create affiliate account" },
      { status: 500 },
    );
  }
}
