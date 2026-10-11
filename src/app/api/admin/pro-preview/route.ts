import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRO_MODULES, PRO_RESOURCES } from "@/lib/pro-course";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// The admin account does not have to purchase Starter to inspect uploaded lessons.
export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const params = new URL(request.url).searchParams;
    const moduleValue = params.get("module");
    const fileValue = params.get("file");
    const moduleNumber = moduleValue === null ? NaN : Number(moduleValue);
    const isVideo =
      fileValue === null &&
      Number.isInteger(moduleNumber) &&
      moduleNumber >= 1 &&
      moduleNumber <= PRO_MODULES.length;
    const isPdf = moduleValue === null && fileValue !== null && PRO_RESOURCES.some(resource=>resource.id === fileValue);
    const assetId = isVideo ? `pro-module-${moduleNumber}` : isPdf ? `pro-${fileValue}` : null;

    if (!assetId) return NextResponse.json({ error: "Invalid lesson or resource" }, { status: 400 });

    const asset = await prisma.courseAsset.findUnique({ where: { id: assetId } });
    if (!asset?.url || typeof asset.url !== "string") {
      return NextResponse.json({ error: "Upload not registered yet" }, { status: 404 });
    }
    const source = new URL(asset.url);
    if (source.protocol !== "https:" || !source.hostname.endsWith(".private.blob.vercel-storage.com")) {
      return NextResponse.json({ error: "Private course origin required" }, { status: 503 });
    }

    const range = request.headers.get("range");
    if (range && (!isVideo || !/^bytes=(?:\d+-\d*|-\d+)$/.test(range))) {
      return NextResponse.json({ error: "Invalid media range" }, { status: 416 });
    }
    const forward = new Headers();
    if (range) forward.set("Range", range);

    const result = await get(asset.url, { access: "private", headers: forward });
    if (!result?.stream) return NextResponse.json({ error: "Resource cannot be retrieved" }, { status: 404 });

    const headers = new Headers({
      "Content-Type": isVideo ? "video/mp4" : "application/pdf",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": isVideo
        ? "inline"
        : `inline; filename="Earnwale-Pro-${fileValue}.pdf"`,
    });
    for (const key of ["content-length", "content-range", "accept-ranges", "etag"]) {
      const value = result.headers.get(key);
      if (value) headers.set(key, value);
    }
    return new Response(result.stream, { status: result.statusCode, headers });
  } catch (error) {
    return authErrorResponse(error);
  }
}
