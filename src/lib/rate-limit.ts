import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function limiterId(namespace: string, key: string) {
  return crypto
    .createHash("sha256")
    .update(`${namespace}:${key}`)
    .digest("hex")
    .slice(0, 40);
}

export async function consumeRateLimit(options: {
  namespace: string;
  key: string;
  limit: number;
  windowMs: number;
}): Promise<boolean> {
  const { namespace, key, limit, windowMs } = options;
  const id = limiterId(namespace, key || "unknown");
  const now = new Date();

  return prisma.$transaction(async (tx: any) => {
    const existing = await tx.rateLimit.findUnique({ where: { id } });
    const windowStart = existing?.windowStart
      ? new Date(existing.windowStart)
      : null;
    const withinWindow =
      windowStart &&
      now.getTime() - windowStart.getTime() < windowMs;

    if (!existing) {
      await tx.rateLimit.create({
        data: {
          id,
          namespace,
          count: 1,
          windowStart: now,
          updatedAt: now,
        },
      });
      return true;
    }

    if (!withinWindow) {
      await tx.rateLimit.update({
        where: { id },
        data: {
          count: 1,
          windowStart: now,
          updatedAt: now,
        },
      });
      return true;
    }

    const count = Number(existing.count ?? 0);
    if (count >= limit) return false;

    await tx.rateLimit.update({
      where: { id },
      data: {
        count: { increment: 1 },
        updatedAt: now,
      },
    });
    return true;
  });
}
