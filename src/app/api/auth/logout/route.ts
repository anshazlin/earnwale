import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/request-security";

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  response.cookies.set("auth_token", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}
