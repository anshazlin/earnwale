import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email: rawEmail, password } = await req.json();
    const email = String(rawEmail ?? "").trim().toLowerCase();
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
