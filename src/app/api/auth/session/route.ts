import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (!origin || !host || new URL(origin).host !== host) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "ID token required" }, { status: 400 });
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(idToken, true);
    const authAgeSeconds = Math.floor(Date.now() / 1000) - Number(decoded.auth_time ?? 0);
    if (!decoded.auth_time || authAgeSeconds > 5 * 60) {
      return NextResponse.json({ error: "Recent sign-in required" }, { status: 401 });
    }
    if (!decoded.email_verified) {
      return NextResponse.json({ error: "Verify your email before signing in" }, { status: 403 });
    }

    const email = String(decoded.email ?? "").trim().toLowerCase();
    const adminEmail = String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const isAdmin = Boolean(adminEmail && email === adminEmail);

    let user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user?.firebaseUid && user.firebaseUid !== decoded.uid) {
        return NextResponse.json({ error: "Account association conflict" }, { status: 403 });
      }
      if (user && !user.firebaseUid) {
        user = await prisma.user.update({ where: { id: user.id }, data: { firebaseUid: decoded.uid } });
      }
    }
    if (!user && !isAdmin) {
      return NextResponse.json({ error: "Account record not found" }, { status: 403 });
    }

    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
    const response = NextResponse.json({ success: true, isAdmin });
    response.cookies.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
      maxAge: Math.floor(SESSION_MAX_AGE_MS / 1000), path: "/",
    });
    response.cookies.set("auth_token", "", { httpOnly: true, expires: new Date(0), path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid or expired authentication token" }, { status: 401 });
  }
}
