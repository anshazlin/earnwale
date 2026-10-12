import crypto from "crypto";

export const AFFILIATE_TERMS_VERSION = "2026-10-12-v1";

export const AFFILIATE_COMMISSIONS: Record<string, number> = {
  "300": 220,
  "500": 400,
};

export function affiliateCommissionForPlan(plan: unknown): number {
  return AFFILIATE_COMMISSIONS[String(plan ?? "").trim()] ?? 0;
}

export function isAffiliateActive(user: any): boolean {
  return (
    String(user?.affiliateStatus ?? "").toLowerCase() === "active" &&
    Boolean(String(user?.referralCode ?? "").trim())
  );
}

function normalizeCode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

async function generateUniqueAffiliateCode(tx: any): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const code = `ERW${crypto.randomInt(10000000, 100000000)}`;
    const existing = await tx.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  throw new Error("Unable to generate affiliate code");
}

export async function activateAffiliate(
  tx: any,
  user: any,
  acceptedAt: Date = new Date(),
) {
  if (!user?.id) throw new Error("Affiliate account not found");

  const currentStatus = String(user.affiliateStatus ?? "inactive").toLowerCase();
  if (currentStatus === "suspended") {
    throw new Error("Affiliate account is suspended");
  }

  let code = normalizeCode(user.referralCode);
  if (code) {
    const owner = await tx.user.findUnique({ where: { referralCode: code } });
    if (owner && owner.id !== user.id) code = "";
  }
  if (!code) code = await generateUniqueAffiliateCode(tx);

  return tx.user.update({
    where: { id: user.id },
    data: {
      affiliateStatus: "active",
      referralCode: code,
      affiliateTermsVersion: AFFILIATE_TERMS_VERSION,
      affiliateTermsAcceptedAt: acceptedAt,
      affiliateActivatedAt: user.affiliateActivatedAt ?? new Date(),
    },
  });
}
