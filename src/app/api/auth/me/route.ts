import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { user } = await requireAuth(req);
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        affiliateStatus: user.affiliateStatus ?? "inactive",
        affiliateCode:
          String(user.affiliateStatus ?? "").toLowerCase() === "active"
            ? user.referralCode ?? null
            : null,
        referralCode: user.referralCode,
        earnings: user.earnings,
        totalEarned: user.totalEarned,
        referralCount: user.referralCount,
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
