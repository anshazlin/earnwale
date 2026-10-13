import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("affiliate program remains free and uses the approved commission schedule", async () => {
  const affiliate = await read("src/lib/affiliate.ts");
  const affiliatePage = await read("src/app/affiliate/page.tsx");
  const dashboard = await read("src/app/dashboard/personal/page.tsx");

  assert.match(affiliate, /"300": 220/);
  assert.match(affiliate, /"500": 400/);
  assert.match(affiliate, /affiliateStatus: "active"/);

  assert.match(affiliatePage, /registration is handled only inside[\s\S]*logged-in Earnwale[\s\S]*dashboard/i);
  assert.match(affiliatePage, /Create free account/);
  assert.doesNotMatch(affiliatePage, /createUserWithEmailAndPassword/);
  assert.doesNotMatch(affiliatePage, /\/api\/affiliate\/register/);

  assert.match(dashboard, /Join Affiliate Program — Free/);
  assert.match(dashboard, /fetch\("\/api\/affiliate"/);
});

test("free account creation does not activate affiliate status or course access", async () => {
  const registerApi = await read("src/app/api/auth/register/route.ts");
  const registerPage = await read("src/app/register/page.tsx");

  assert.match(registerApi, /plan: null/);
  assert.match(registerApi, /affiliateStatus: "inactive"/);
  assert.match(registerApi, /referralCode: null/);
  assert.doesNotMatch(registerApi, /affiliateStatus: "active"/);
  assert.doesNotMatch(registerApi, /password\s*:/);

  assert.match(registerPage, /Create free account/);
  assert.match(registerPage, /join the Affiliate Program from your dashboard after login/i);
});

test("affiliate activation happens only through authenticated dashboard API", async () => {
  const affiliateApi = await read("src/app/api/affiliate/route.ts");
  const session = await read("src/app/api/auth/session/route.ts");

  assert.match(affiliateApi, /requireAuth\(req\)/);
  assert.match(affiliateApi, /activateAffiliate/);
  assert.match(affiliateApi, /acceptTerms/);

  assert.doesNotMatch(session, /pending_verification/);
  assert.doesNotMatch(session, /activateAffiliate/);
});

test("course purchase does not automatically activate affiliate status", async () => {
  const verify = await read("src/app/api/payment/verify/route.ts");
  const dashboardApi = await read("src/app/api/dashboard/route.ts");

  assert.match(verify, /affiliateStatus: "inactive"/);
  assert.match(verify, /referralCode: null/);
  assert.doesNotMatch(verify, /PLAN_REWARDS/);
  assert.doesNotMatch(verify, /generateUniqueReferralCode/);

  assert.doesNotMatch(dashboardApi, /ensureReferralCode/);
  assert.doesNotMatch(dashboardApi, /randomInt/);
});

test("affiliate attribution is active-only, server-bound and payment-idempotent", async () => {
  const order = await read("src/app/api/payment/create-order/route.ts");
  const verify = await read("src/app/api/payment/verify/route.ts");
  const commissions = await read("src/lib/affiliate-commission.ts");

  assert.match(order, /affiliateCode/);
  assert.match(order, /notes:/);
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

test("logged-in free accounts can later buy a course on the same identity", async () => {
  const createOrder = await read("src/app/api/payment/existing/create-order/route.ts");
  const verify = await read("src/app/api/payment/existing/verify/route.ts");
  const signup = await read("src/app/signup/SignupContent.tsx");

  assert.match(createOrder, /requireAuth\(req\)/);
  assert.match(createOrder, /existingAccount: "true"/);
  assert.match(createOrder, /userId: String\(user\.id\)/);
  assert.match(createOrder, /if \(currentPlan && !\(friendInvite && currentPlan === "300"\)\)/);

  assert.match(verify, /requireAuth\(req\)/);
  assert.match(verify, /timingSafeEqual/);
  assert.match(verify, /razorpay\.orders\.fetch/);
  assert.match(verify, /razorpay\.payments\.fetch/);
  assert.match(verify, /order\.notes\?\.userId/);
  assert.match(verify, /data: \{[\s\S]*plan,/);

  assert.match(signup, /\/api\/payment\/existing\/create-order/);
  assert.match(signup, /\/api\/payment\/existing\/verify/);
  assert.doesNotMatch(signup, /affiliate account/);
  assert.doesNotMatch(signup, /htmlFor="affiliateCode"/);
  assert.doesNotMatch(signup, /Affiliate Code \(Optional\)/);
  assert.match(signup, /searchParams\.get\("aff"\)/);
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

test("production test-credit and obsolete public affiliate/payout endpoints are removed", async () => {
  await assert.rejects(
    read("src/app/api/admin/users/test-referral/route.ts"),
    /ENOENT/,
  );
  await assert.rejects(
    read("src/app/api/admin/withdraw/update/route.ts"),
    /ENOENT/,
  );
  await assert.rejects(
    read("src/app/api/affiliate/register/route.ts"),
    /ENOENT/,
  );
});

test("public positioning separates education purchase from dashboard affiliate enrollment", async () => {
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

test("Starter alone becomes ₹1 with Razorpay Test Mode while Pro remains ₹500", async () => {
  const amounts = await read("src/lib/payment-amounts.ts");
  const createOrder = await read("src/app/api/payment/create-order/route.ts");
  const verify = await read("src/app/api/payment/verify/route.ts");
  const existingCreate = await read("src/app/api/payment/existing/create-order/route.ts");
  const existingVerify = await read("src/app/api/payment/existing/verify/route.ts");

  assert.match(amounts, /"300": 30000/);
  assert.match(amounts, /"500": 50000/);
  assert.match(amounts, /razorpayKey\.startsWith\("rzp_test_"\)/);
  assert.match(amounts, /normalizedPlan === "300" && isOneRupeeTestCheckout\(\)/);
  assert.match(amounts, /return 100/);
  assert.match(amounts, /return catalogAmount/);

  assert.match(createOrder, /checkoutAmountForPlan/);
  assert.match(createOrder, /plan === "300" && isOneRupeeTestCheckout\(\)/);
  assert.match(verify, /checkoutAmountForPlan/);
  assert.match(existingCreate, /checkoutAmountForPlan/);
  assert.match(existingCreate, /plan === "300" && isOneRupeeTestCheckout\(\)/);
  assert.match(existingVerify, /checkoutAmountForPlan/);
});

test("customer and admin sessions auto logout after ten minutes of inactivity", async () => {
  const guard = await read("src/app/components/IdleSessionGuard.tsx");
  const dashboardShell = await read("src/app/dashboard/_components/dashboard-shell.tsx");
  const adminShell = await read("src/app/admin/_components/admin-shell.tsx");
  const login = await read("src/app/login/page.tsx");

  assert.match(guard, /IDLE_TIMEOUT_MS = 10 \* 60 \* 1000/);
  assert.match(guard, /\/api\/auth\/logout/);
  assert.match(guard, /visibilitychange/);
  assert.match(guard, /earnwale:lastActivity/);
  assert.match(dashboardShell, /IdleSessionGuard/);
  assert.match(adminShell, /IdleSessionGuard/);
  assert.match(login, /earnwale:lastActivity/);
});
