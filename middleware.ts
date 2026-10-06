import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "firebase_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = ["/dashboard", "/admin"].some(route => pathname.startsWith(route));
  if (!isProtected) return NextResponse.next();
  if (!req.cookies.get(COOKIE_NAME)?.value) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

// Edge middleware performs presence-only routing. Every protected API performs
// authoritative Firebase Admin session verification and user/admin authorization.
export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
