import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("₹1 public Starter and ₹500 Pro are the only live course prices", async () => {
  const amounts = await read("src/lib/payment-amounts.ts");
  assert.match(amounts, /"300": 100/);
  assert.match(amounts, /"500": 50000/);
  assert.match(amounts, /return catalogAmount/);
  assert.doesNotMatch(amounts, /normalizedPlan === "300" && isOneRupeeTestCheckout/);
  const signup = await read("src/app/signup/SignupContent.tsx");
  assert.match(signup, /id: "300"/);
  assert.match(signup, /price: "₹1"/);
  assert.match(signup, /id: "500"/);
  assert.match(signup, /price: "₹500"/);
  assert.match(signup, /Pay ₹1 and enroll in Starter/);
  assert.match(signup, /Pay ₹500 and enroll in Pro/);
  const homepage = await read("src/app/page.tsx");
  assert.match(homepage, /Enroll in Starter — ₹1/);
  assert.match(homepage, /Enroll in Pro — ₹500/);
  assert.doesNotMatch(homepage, /enrollment opening soon|Pro launch checks/);
  const dashboard = await read("src/app/dashboard/page.tsx");
  assert.match(dashboard, /Starter · ₹1/);
  assert.match(dashboard, /Pro · ₹500/);
});

test("both enrollment paths open without env flags but still require real private files", async () => {
  const gate = await read("src/lib/course-enrollment.ts");
  assert.match(gate, /return plan === "300" \|\| plan === "500"/);
  assert.match(gate, /enrollmentFlagEnabled\(plan\) && await verifiedCourseAssetsReady\(plan\)/);
  assert.match(gate, /await head\(asset\.url\)/);
  assert.match(gate, /stored\.size > 0/);
  const newOrder = await read("src/app/api/payment/create-order/route.ts");
  const existingOrder = await read("src/app/api/payment/existing/create-order/route.ts");
  for (const order of [newOrder, existingOrder]) {
    assert.match(order, /checkoutAmountForPlan\(plan\)/);
    assert.match(order, /verifiedCourseAssetsReady\(selectedPlan\)/);
    assert.match(order, /razorpay\.orders\.create/);
    assert.match(order, /isSameOriginRequest\(req\)/);
  }
  const status = await read("src/app/api/academy/enrollment-status/route.ts");
  assert.match(status, /enrollmentAvailable\("300"\)/);
  assert.match(status, /enrollmentAvailable\("500"\)/);
});

test("₹1 payment purchases standard full Starter access, not an expiring trial", async () => {
  const fresh = await read("src/app/api/payment/verify/route.ts");
  const existing = await read("src/app/api/payment/existing/verify/route.ts");
  for (const route of [fresh, existing]) {
    assert.match(route, /checkoutAmountForPlan\(plan\)/);
    assert.match(route, /Number\(payment\.amount\) !== expectedAmount/);
    assert.match(route, /Number\(order\.amount\) !== expectedAmount/);
    assert.match(route, /razorpay\.payments\.fetch/);
    assert.match(route, /timingSafeEqual/);
    assert.match(route, /\bplan,/);
    assert.match(route, /plan === "300" \? null/);
  }
  const catalogue = await read("src/lib/trading-course.ts");
  assert.match(catalogue, /ACCESS_PLANS = new Set\(\["300", "500"\]\)/);
  const starterMedia = await read("src/app/api/trading/media/route.ts");
  assert.match(starterMedia, /hasTradingAccess\(user\.plan\)/);
  const starterQuiz = await read("src/app/api/trading/quiz/route.ts");
  assert.match(starterQuiz, /hasTradingAccess\(user\.plan\)/);
  const pro = await read("src/lib/pro-course.ts");
  assert.match(pro, /trim\(\) === "500"/);
});

test("₹1 Starter transactions cannot mint ₹220 referral credits", async () => {
  const affiliate = await read("src/lib/affiliate.ts");
  const commission = await read("src/lib/affiliate-commission.ts");
  assert.match(affiliate, /"300": 0/);
  assert.match(affiliate, /"500": 400/);
  assert.match(commission, /amount <= 0/);
  const terms = await read("src/app/affiliate-terms/page.tsx");
  assert.match(terms, /No commission is paid on a ₹1 Starter/);
  const homepage = await read("src/app/page.tsx");
  assert.doesNotMatch(homepage, /₹220 commission/);
});
