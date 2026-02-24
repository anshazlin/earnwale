import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "auth_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/admin"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // 🔐 Extra protection for admin route
    if (pathname.startsWith("/admin")) {
      if (decoded.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};