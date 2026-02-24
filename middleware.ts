import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "auth_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

 
};