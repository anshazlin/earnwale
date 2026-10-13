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
  const normalizedPlan = String(plan ?? "").trim();
  const catalogAmount = PLAN_AMOUNTS[normalizedPlan];
  if (!catalogAmount) return undefined;

  // Temporary Razorpay test convenience: only the ₹300 Starter checkout is ₹1.
  // Pro remains ₹500 even in preview/test mode.
  if (normalizedPlan === "300" && isOneRupeeTestCheckout()) return 100;
  return catalogAmount;
}
