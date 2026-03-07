import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const COOKIE_NAME = "auth_token";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    // 🔐 Get user from cookie
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

        // 🔐 Access control logic

    if (file === "scholar") {
    if (user.plan !== "300" && user.plan !== "500") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    }

    if (file === "capital") {
    if (user.plan !== "500") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    }

    let filePath = "";

    if (file === "scholar") {
      filePath = path.join(process.cwd(), "src/secure-files/scholar-protocol.pdf");
    }

    if (file === "capital") {
      filePath = path.join(process.cwd(), "src/secure-files/capital-compounder.pdf");
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}