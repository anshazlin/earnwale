import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function processReferralCommission(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.referredBy) return;

  const referrer = await prisma.user.findUnique({
    where: { referralCode: user.referredBy },
  });

  if (!referrer) return;

  // Determine reward based on plan
  let rewardAmount = 0;

  if (user.plan === "300") {
    rewardAmount = 250;
  } else if (user.plan === "500") {
    rewardAmount = 450;
  } else {
    return;
  }

  // Prevent duplicate rewards
  if (user.hasReceivedReward) return;

  // Update referrer wallet
  await prisma.user.update({
    where: { id: referrer.id },
    data: {
      earnings: { increment: rewardAmount },
      totalEarned: { increment: rewardAmount },
      referralCount: { increment: 1 },
    },
  });

  // Create transaction entry
  await prisma.transaction.create({
    data: {
      userId: referrer.id,
      type: "CREDIT",
      amount: rewardAmount,
      fromUser: user.id,
    },
  });

  // Mark reward processed
  await prisma.user.update({
    where: { id: user.id },
    data: {
      hasReceivedReward: true,
    },
  });
}