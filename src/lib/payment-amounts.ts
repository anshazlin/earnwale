export const PLAN_AMOUNTS: Record<string, number> = {
  "300": 30000,
  "500": 50000,
};

export function isOneRupeeTestCheckout(): boolean {
  const razorpayKey = String(process.env.RAZORPAY_KEY_ID ?? "");
  const vercelEnv = String(process.env.VERCEL_ENV ?? "").toLowerCase();

  const nonProduction =
    vercelEnv === "preview" ||
    vercelEnv === "development" ||
    (vercelEnv === "" && process.env.NODE_ENV !== "production");

  return nonProduction && razorpayKey.startsWith("rzp_test_");
}

export function checkoutAmountForPlan(plan: unknown): number | undefined {
  const catalogAmount = PLAN_AMOUNTS[String(plan ?? "").trim()];
  if (!catalogAmount) return undefined;

  return isOneRupeeTestCheckout() ? 100 : catalogAmount;
}
