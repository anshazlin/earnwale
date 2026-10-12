import { NextResponse } from "next/server";
import {
  AFFILIATE_COMMISSIONS,
  AFFILIATE_TERMS_VERSION,
  activateAffiliate,
  isAffiliateActive,
} from "@/lib/affiliate";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginRequest } from "@/lib/request-security";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    const active = isAffiliateActive(user);

    return NextResponse.json({
      status: String(user.affiliateStatus ?? "inactive"),
      active,
      affiliateCode: active ? user.referralCode : null,
      affiliateTermsVersion: user.affiliateTermsVersion ?? null,
      affiliateTermsAcceptedAt: user.affiliateTermsAcceptedAt ?? null,
      commissionSchedule: AFFILIATE_COMMISSIONS,
      qualifyingSales: Number(user.referralCount ?? 0),
      availableCommission: Number(user.earnings ?? 0),
      lifetimeCommission: Number(user.totalEarned ?? 0),
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const { user } = await requireAuth(req);
    const { acceptTerms } = await req.json();

    if (acceptTerms !== true) {
      return NextResponse.json(
        { error: "Affiliate Terms must be accepted" },
        { status: 400 },
      );
    }

    const activated = await prisma.$transaction(async (tx: typeof prisma) => {
      const latest = await tx.user.findUnique({ where: { id: user.id } });
      if (!latest) throw new Error("Affiliate account not found");

      return activateAffiliate(tx, {
        ...latest,
        affiliateTermsVersion: AFFILIATE_TERMS_VERSION,
      });
    });

    return NextResponse.json({
      success: true,
      status: "active",
      affiliateCode: activated.referralCode,
      commissionSchedule: AFFILIATE_COMMISSIONS,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Affiliate account is suspended") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return authErrorResponse(error);
  }
}
