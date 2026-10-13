import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";

const RECENT_AUTH_SECONDS = 5 * 60;

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const allowed = await consumeRateLimit({
      namespace: "account-register",
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

    const { idToken } = await req.json();
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
      return NextResponse.json({ error: "Email account required" }, { status: 400 });
    }

    const byUid = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    const byEmail = await prisma.user.findUnique({ where: { email } });
    const existing = byUid ?? byEmail;

    if (existing) {
      if (existing.firebaseUid && String(existing.firebaseUid) !== decoded.uid) {
        return NextResponse.json(
          { error: "Account association conflict" },
          { status: 409 },
        );
      }

      return NextResponse.json({
        success: true,
        verificationRequired: !decoded.email_verified,
      });
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
        affiliateStatus: "inactive",
      },
    });

    return NextResponse.json({
      success: true,
      verificationRequired: !decoded.email_verified,
    });
  } catch (error: unknown) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";

    if (code.startsWith("auth/")) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 },
      );
    }

    console.error("Account registration failed", error);
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 },
    );
  }
}
