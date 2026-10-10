import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");
    if (!file || !["scholar", "capital"].includes(file)) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const { user } = await requireAuth(req);
    const plan = String(user.plan ?? "").trim();

    if (file === "scholar" && plan !== "300" && plan !== "500") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (file === "capital" && plan !== "500") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const filePath = path.join(
      process.cwd(),
      file === "scholar"
        ? "src/secure-files/scholar-protocol.pdf"
        : "src/secure-files/capital-compounder.pdf",
    );

    return new NextResponse(fs.readFileSync(filePath), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
