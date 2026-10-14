import { head } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { PRO_MODULES, PRO_RESOURCES } from "@/lib/pro-course";
import { COURSE_MODULES } from "@/lib/trading-course";

export type EnrollmentPlan = "300" | "500";

export const STARTER_REQUIRED_IDS = [
  ...COURSE_MODULES.map(module => `module-${module.id}`),
  "handbook",
  "workbook",
];
export const PRO_REQUIRED_IDS = [
  ...PRO_MODULES.map(module => `pro-module-${module.id}`),
  ...PRO_RESOURCES.map(resource => `pro-${resource.id}`),
];

// Both public course plans are open. The payment route still verifies all
// uploaded private resources before creating a Razorpay order.
export function enrollmentFlagEnabled(plan: EnrollmentPlan): boolean {
  return plan === "300" || plan === "500";
}

export async function verifiedCourseAssetsReady(plan: EnrollmentPlan): Promise<boolean> {
  // Pro includes the entire Starter collection, not only its additional files.
  const required = plan === "500"
    ? [...STARTER_REQUIRED_IDS, ...PRO_REQUIRED_IDS]
    : STARTER_REQUIRED_IDS;

  const verified = await Promise.all(required.map(async id => {
    try {
      const asset = await prisma.courseAsset.findUnique({ where: { id } });
      if (!asset || typeof asset.url !== "string" || !asset.url) return false;
      const parsed = new URL(asset.url);
      if (parsed.protocol !== "https:" ||
          !parsed.hostname.endsWith(".private.blob.vercel-storage.com")) return false;

      // Every file must exist as a non-empty private Blob object at checkout.
      const stored = await head(asset.url);
      return stored.size > 0;
    } catch {
      return false;
    }
  }));
  return verified.every(Boolean);
}

export async function enrollmentAvailable(plan: EnrollmentPlan): Promise<boolean> {
  return enrollmentFlagEnabled(plan) && await verifiedCourseAssetsReady(plan);
}
