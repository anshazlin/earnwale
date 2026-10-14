export const PLAN_AMOUNTS: Record<string, number> = {
  "300": 100,
  "500": 50000,
};

export function isOneRupeeTestCheckout(): boolean {
  const razorpayKey = String(process.env.RAZORPAY_KEY_ID ?? "");
  return razorpayKey.startsWith("rzp_test_");
}

export function checkoutAmountForPlan(plan: unknown): number | undefined {
  const normalizedPlan = String(plan ?? "").trim();
  const catalogAmount = PLAN_AMOUNTS[normalizedPlan];
  if (!catalogAmount) return undefined;

  // "300" is the stable Starter entitlement ID, not the live price.
  // The public Starter course costs ₹1 (100 paise) in BOTH live and test mode.
  // Pro remains ₹500 and both prices are independently verified after payment.
  return catalogAmount;
}
