import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("affiliate program is free, explicit and uses the approved commission schedule", async () => {
  const affiliate = await read("src/lib/affiliate.ts");
  const registration = await read("src/app/api/affiliate/register/route.ts");
  const page = await read("src/app/affiliate/page.tsx");

  assert.match(affiliate, /"300": 220/);
  assert.match(affiliate, /"500": 400/);
  assert.match(affiliate, /affiliateStatus: "active"/);
  assert.match(registration, /plan: null/);
  assert.match(registration, /affiliateStatus: "pending_verification"/);
  assert.doesNotMatch(registration, /password\s*:/);
  assert.match(page, /Joining is free/);
  assert.match(page, /do not need to buy a course/i);
  assert.match(page, /No joining bonus, recruitment commission, downline/);
});

test("verified sign-in activates pending affiliates instead of course purchase", async () => {
  const session = await read("src/app/api/auth/session/route.ts");
  const verify = await read("src/app/api/payment/verify/route.ts");

  assert.match(session, /pending_verification/);
  assert.match(session, /activateAffiliate/);
  assert.match(session, /email_verified/);

  assert.match(verify, /affiliateStatus: "inactive"/);
  assert.match(verify, /referralCode: null/);
  assert.doesNotMatch(verify, /PLAN_REWARDS/);
  assert.doesNotMatch(verify, /generateUniqueReferralCode/);
});

test("affiliate attribution is active-only, server-bound and payment-idempotent", async () => {
  const order = await read("src/app/api/payment/create-order/route.ts");
  const verify = await read("src/app/api/payment/verify/route.ts");
  const commissions = await read("src/lib/affiliate-commission.ts");

  assert.match(order, /notes: \{ plan, affiliateCode \}/);
  assert.match(verify, /order\.notes\?\.affiliateCode/);
  assert.match(verify, /resolveActiveAffiliate/);
  assert.match(commissions, /isAffiliateActive/);
  assert.match(commissions, /commission_\$\{input\.razorpayPaymentId\}/);
  assert.match(commissions, /sourcePaymentId/);
  assert.match(commissions, /sourceOrderId/);
  assert.match(commissions, /sourceUserId/);
  assert.match(commissions, /commissionStatus: "earned"/);
});

test("self-referral and inactive affiliate codes never create commission", async () => {
  const commissions = await read("src/lib/affiliate-commission.ts");

  assert.match(commissions, /if \(!affiliate \|\| !isAffiliateActive\(affiliate\)\) return null/);
  assert.match(commissions, /affiliate\.id === buyer\.id/);
  assert.match(commissions, /buyerEmail === affiliateEmail/);
});

test("affiliate-only accounts can later buy a course on the same identity", async () => {
  const createOrder = await read("src/app/api/payment/existing/create-order/route.ts");
  const verify = await read("src/app/api/payment/existing/verify/route.ts");
  const signup = await read("src/app/signup/SignupContent.tsx");

  assert.match(createOrder, /requireAuth\(req\)/);
  assert.match(createOrder, /existingAccount: "true"/);
  assert.match(createOrder, /userId: String\(user\.id\)/);
  assert.match(createOrder, /if \(currentPlan\)/);

  assert.match(verify, /requireAuth\(req\)/);
  assert.match(verify, /timingSafeEqual/);
  assert.match(verify, /razorpay\.orders\.fetch/);
  assert.match(verify, /razorpay\.payments\.fetch/);
  assert.match(verify, /order\.notes\?\.userId/);
  assert.match(verify, /data: \{[\s\S]*plan,/);

  assert.match(signup, /\/api\/payment\/existing\/create-order/);
  assert.match(signup, /\/api\/payment\/existing\/verify/);
  assert.match(signup, /No paid course is attached to this account/);
});

test("course access remains separate from affiliate membership", async () => {
  const trading = await read("src/app/api/trading/media/route.ts");
  const pro = await read("src/app/api/pro/media/route.ts");
  const dashboard = await read("src/app/dashboard/page.tsx");

  assert.match(trading, /requireAuth\(req\)/);
  assert.match(trading, /hasTradingAccess/);
  assert.match(pro, /requireAuth\(req\)/);
  assert.match(pro, /hasProAccess/);
  assert.match(dashboard, /Affiliate Program membership does not unlock paid learning content/);
});

test("dashboard no longer auto-generates referral codes for customers", async () => {
  const dashboardApi = await read("src/app/api/dashboard/route.ts");
  const dashboard = await read("src/app/dashboard/personal/page.tsx");

  assert.doesNotMatch(dashboardApi, /ensureReferralCode/);
  assert.doesNotMatch(dashboardApi, /randomInt/);
  assert.match(dashboardApi, /affiliateStatus/);
  assert.match(dashboard, /Join Affiliate Program — Free/);
  assert.match(dashboard, /\/signup\?aff=/);
});

test("money mutations keep auth, origin checks and withdrawal floor", async () => {
  const withdraw = await read("src/app/api/withdraw/request/route.ts");
  const adminPayout = await read("src/app/api/admin/withdrawal/update/route.ts");
  const payment = await read("src/app/api/payment/verify/route.ts");
  const legacy = await read("src/app/api/auth/migrate-legacy/route.ts");

  assert.match(withdraw, /const MIN_WITHDRAWAL = 250/);
  assert.match(withdraw, /requireAuth\(req\)/);
  assert.match(withdraw, /isSameOriginRequest/);

  assert.match(adminPayout, /requireAdmin\(req\)/);
  assert.match(adminPayout, /paymentReference/);
  assert.match(adminPayout, /isSameOriginRequest/);

  assert.match(payment, /consumeRateLimit/);
  assert.match(payment, /isSameOriginRequest/);
  assert.match(legacy, /legacy-auth-ip/);
  assert.match(legacy, /legacy-auth-account/);
});

test("production test-credit and obsolete payout mutation endpoints are removed", async () => {
  await assert.rejects(
    read("src/app/api/admin/users/test-referral/route.ts"),
    /ENOENT/,
  );
  await assert.rejects(
    read("src/app/api/admin/withdraw/update/route.ts"),
    /ENOENT/,
  );
});

test("public positioning separates education purchase from affiliate participation", async () => {
  const home = await read("src/app/page.tsx");
  const terms = await read("src/app/terms-and-conditions/page.tsx");
  const affiliateTerms = await read("src/app/affiliate-terms/page.tsx");

  assert.match(home, /Joining the Affiliate Program is free and does not require a course purchase/);
  assert.match(home, /no recruitment commissions, downlines or guaranteed earnings/i);
  assert.match(terms, /Buying a course is not required to join/);
  assert.match(affiliateTerms, /No commission is paid for recruiting another affiliate/);
  assert.match(affiliateTerms, /₹220/);
  assert.match(affiliateTerms, /₹400/);
});


test("one-rupee checkout is restricted to Razorpay test preview or development", async () => {
  const amounts = await read("src/lib/payment-amounts.ts");
  const createOrder = await read("src/app/api/payment/create-order/route.ts");
  const verify = await read("src/app/api/payment/verify/route.ts");
  const existingCreate = await read("src/app/api/payment/existing/create-order/route.ts");
  const existingVerify = await read("src/app/api/payment/existing/verify/route.ts");

  assert.match(amounts, /"300": 30000/);
  assert.match(amounts, /"500": 50000/);
  assert.match(amounts, /razorpayKey\.startsWith\("rzp_test_"\)/);
  assert.match(amounts, /vercelEnv === "preview"/);
  assert.match(amounts, /process\.env\.NODE_ENV !== "production"/);
  assert.match(amounts, /return isOneRupeeTestCheckout\(\) \? 100 : catalogAmount/);

  assert.match(createOrder, /checkoutAmountForPlan/);
  assert.match(createOrder, /one-rupee-preview/);
  assert.match(verify, /checkoutAmountForPlan/);
  assert.match(existingCreate, /checkoutAmountForPlan/);
  assert.match(existingVerify, /checkoutAmountForPlan/);
});
