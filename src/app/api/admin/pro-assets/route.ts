import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { head } from "@vercel/blob";

export const dynamic = "force-dynamic";

const ASSETS: Record<string, { path: string; mime: string; maxBytes: number }> = {
  "pro-module-1": {path:"earnwale/pro/module-1.mp4",mime:"video/mp4",maxBytes:150_000_000},
  "pro-module-2": {path:"earnwale/pro/module-2.mp4",mime:"video/mp4",maxBytes:150_000_000},
  "pro-module-3": {path:"earnwale/pro/module-3.mp4",mime:"video/mp4",maxBytes:150_000_000},
  "pro-module-4": {path:"earnwale/pro/module-4.mp4",mime:"video/mp4",maxBytes:150_000_000},
  "pro-module-5": {path:"earnwale/pro/module-5.mp4",mime:"video/mp4",maxBytes:150_000_000},
  "pro-module-6": {path:"earnwale/pro/module-6.mp4",mime:"video/mp4",maxBytes:150_000_000},
  "pro-handbook": {path:"earnwale/pro/handbook.pdf",mime:"application/pdf",maxBytes:15_000_000},
  "pro-workbook": {path:"earnwale/pro/workbook.pdf",mime:"application/pdf",maxBytes:15_000_000},
  "pro-journal": {path:"earnwale/pro/journal.pdf",mime:"application/pdf",maxBytes:15_000_000},
  "pro-cases": {path:"earnwale/pro/cases.pdf",mime:"application/pdf",maxBytes:15_000_000},
  "pro-practice": {path:"earnwale/pro/practice.pdf",mime:"application/pdf",maxBytes:15_000_000},
};

function isExpectedUpload(assetId: string, pathname: string) {
  return Boolean(ASSETS[assetId] && ASSETS[assetId].path === pathname);
}
async function authorise(request: Request) {
  await requireAdmin(request);
}
export async function GET(request: Request) {
  try {
    await authorise(request);
    const found = await Promise.all(Object.keys(ASSETS).map(async (id) => {
      const data = await prisma.courseAsset.findUnique({ where: { id } });
      if (typeof data?.url !== "string" || !data.url.includes(".private.blob.vercel-storage.com")) {
        return { id, ready: false, recorded: Boolean(data?.url), updatedAt: data?.updatedAt ?? null };
      }
      try {
        const blob = await head(data.url);
        return { id, ready: blob.size > 0, recorded: true, updatedAt: data?.updatedAt ?? null };
      } catch {
        return { id, ready: false, recorded: true, updatedAt: data?.updatedAt ?? null };
      }
    }));
    return NextResponse.json({ assets: found }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const body = await request.json() as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        await authorise(request);
        const assetId = String(clientPayload ?? "");
        if (!isExpectedUpload(assetId, pathname)) throw new Error("Invalid course asset");
        const asset = ASSETS[assetId];
        return {
          allowedContentTypes: [asset.mime],
          maximumSizeInBytes: asset.maxBytes,
          addRandomSuffix: true,
          tokenPayload: assetId,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const assetId = String(tokenPayload ?? "");
        if (!isExpectedUpload(assetId, blob.pathname.replace(/-[a-zA-Z0-9]+(?=\.(mp4|pdf)$)/, ""))) {
          throw new Error("Uploaded course asset mismatch");
        }
        const url = new URL(blob.url);
        if (url.protocol !== "https:" || !url.hostname.endsWith(".private.blob.vercel-storage.com")) {
          throw new Error("Uploaded asset has an unexpected storage origin");
        }
        const current = await prisma.courseAsset.findUnique({ where: { id: assetId } });
        const data = { url: blob.url, pathname: blob.pathname, updatedAt: new Date(), courseId: "trading-pro-v1" };
        if (current) await prisma.courseAsset.update({ where: { id: assetId }, data });
        else await prisma.courseAsset.create({ data: { id: assetId, ...data } });
      },
    });
    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
