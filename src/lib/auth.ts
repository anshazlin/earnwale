import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "firebase_session";
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cookieValue(req: Request, name: string) {
  const cookie = req.headers.get("cookie") ?? "";
  const entry = cookie.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export class AuthError extends Error {
  constructor(message: string, public status = 401) { super(message); }
}

export async function requireAuth(req: Request, options: { allowUnverified?: boolean } = {}) {
  const session = cookieValue(req, SESSION_COOKIE);
  if (!session) throw new AuthError("Unauthorized", 401);
  let decoded;
  try { decoded = await firebaseAdminAuth.verifySessionCookie(session, true); }
  catch { throw new AuthError("Invalid or expired session", 401); }
  if (!options.allowUnverified && !decoded.email_verified) throw new AuthError("Email verification required", 403);

  const email = String(decoded.email ?? "").trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
  if (!user && email) {
    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      if (byEmail.firebaseUid && byEmail.firebaseUid !== decoded.uid) throw new AuthError("Account association conflict", 403);
      user = byEmail.firebaseUid ? byEmail : await prisma.user.update({ where: { id: byEmail.id }, data: { firebaseUid: decoded.uid } });
    }
  }
  if (!user) throw new AuthError("Account record not found", 403);
  return { decoded, user };
}

export async function requireAdmin(req: Request) {
  const auth = await requireAuth(req);
  const adminEmail = String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!adminEmail || String(auth.decoded.email ?? "").toLowerCase() !== adminEmail) throw new AuthError("Admin only", 403);
  return auth;
}

export function authErrorResponse(error: unknown) {
  const status = error instanceof AuthError ? error.status : 500;
  const message = error instanceof AuthError ? error.message : "Authentication failed";
  return Response.json({ error: message }, { status });
}
