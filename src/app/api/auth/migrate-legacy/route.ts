import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { clientIp, isSameOriginRequest } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const { email: rawEmail, password } = await req.json();
    const email = String(rawEmail ?? "").trim().toLowerCase();

    const [ipAllowed, accountAllowed] = await Promise.all([
      consumeRateLimit({
        namespace: "legacy-auth-ip",
        key: clientIp(req),
        limit: 30,
        windowMs: 15 * 60 * 1000,
      }),
      consumeRateLimit({
        namespace: "legacy-auth-account",
        key: email,
        limit: 8,
        windowMs: 15 * 60 * 1000,
      }),
    ]);
    if (!ipAllowed || !accountAllowed) {
      return NextResponse.json(
        { error: "Too many sign-in attempts. Please try again later." },
        { status: 429 },
      );
    }
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.password) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    let firebaseUser;
    try {
      firebaseUser = await firebaseAdminAuth.getUserByEmail(email);
      if (user.firebaseUid && user.firebaseUid !== firebaseUser.uid) {
        return NextResponse.json({ error: "Account association conflict" }, { status: 409 });
      }
      // Legacy password was just proven against bcrypt; synchronize the Firebase
      // credential during this controlled bridge without removing the bcrypt hash yet.
      await firebaseAdminAuth.updateUser(firebaseUser.uid, { password });
    } catch (error: any) {
      if (error?.code !== "auth/user-not-found") throw error;
      firebaseUser = await firebaseAdminAuth.createUser({ email, password, emailVerified: false });
    }

    if (!user.firebaseUid) {
      await prisma.user.update({ where: { id: user.id }, data: { firebaseUid: firebaseUser.uid } });
    }

    return NextResponse.json({ success: true, verificationRequired: !firebaseUser.emailVerified });
  } catch (error) {
    console.error("Legacy auth migration failed", error);
    return NextResponse.json({ error: "Account migration failed" }, { status: 500 });
  }
}
