import {
  affiliateCommissionForPlan,
  isAffiliateActive,
} from "@/lib/affiliate";

export async function resolveActiveAffiliate(
  tx: any,
  code: unknown,
  buyer: { id?: string | null; email?: string | null },
) {
  const normalizedCode = String(code ?? "").trim().toUpperCase();
  if (!normalizedCode) return null;

  const affiliate = await tx.user.findUnique({
    where: { referralCode: normalizedCode },
  });
  if (!affiliate || !isAffiliateActive(affiliate)) return null;

  const buyerEmail = String(buyer.email ?? "").trim().toLowerCase();
  const affiliateEmail = String(affiliate.email ?? "").trim().toLowerCase();
  if (buyer.id && affiliate.id === buyer.id) return null;
  if (buyerEmail && affiliateEmail && buyerEmail === affiliateEmail) return null;

  return affiliate;
}

export async function creditAffiliateCommission(
  tx: any,
  input: {
    affiliate: any;
    buyerUserId: string;
    plan: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
  },
) {
  const amount = affiliateCommissionForPlan(input.plan);
  if (!input.affiliate || amount <= 0) return null;

  const commissionId = `commission_${input.razorpayPaymentId}`;
  const existing = await tx.transaction.findUnique({
    where: { id: commissionId },
  });
  if (existing) return existing;

  await tx.user.update({
    where: { id: input.affiliate.id },
    data: {
      earnings: { increment: amount },
      totalEarned: { increment: amount },
      referralCount: { increment: 1 },
    },
  });

  return tx.transaction.create({
    data: {
      id: commissionId,
      userId: input.affiliate.id,
      amount,
      type: "CREDIT",
      description: `Affiliate commission • ₹${input.plan} course sale`,
      fromUser: input.buyerUserId,
      sourcePaymentId: input.razorpayPaymentId,
      sourceOrderId: input.razorpayOrderId,
      sourceUserId: input.buyerUserId,
      sourcePlan: input.plan,
      commissionStatus: "earned",
    },
  });
}
