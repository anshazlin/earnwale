import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("buyers see immediate payment confirmation progress, and verified success before email delivery", async () => {
  const signup = await read("src/app/signup/SignupContent.tsx");
  const popup = await read("src/app/signup/_components/PurchaseStatusDialog.tsx");
  assert.match(signup, /handler: async \(response: RazorpaySuccessResponse\)/);
  assert.match(signup, /setPurchaseStep\("confirming"\)/);
  assert.match(signup, /const verifyRes = await fetch\(verifyEndpoint/);
  assert.match(signup, /if \(!verifyRes\.ok\)/);
  assert.match(signup, /setPurchaseStep\("payment-error"\)/);
  assert.match(signup, /setPurchaseStep\("completed"\)/);
  assert.ok(signup.indexOf('setPurchaseStep("completed")') < signup.indexOf('sendEmailVerification(credential.user)'));
  assert.match(signup, /setVerificationEmailStatus\("sent"\)/);
  assert.match(signup, /setVerificationEmailStatus\("failed"\)/);
  assert.match(signup, /window\.location\.replace\("\/login\?verify=1"\)/);
  assert.match(signup, /<PurchaseStatusDialog/);
  assert.match(popup, /role="alertdialog"/);
  assert.match(popup, /aria-modal="true"/);
  assert.match(popup, /Payment successful!/);
  assert.match(popup, /Verify your email before logging in/);
  assert.match(popup, /Spam, Junk and Promotions/);
  assert.match(popup, /Continue to login/);
  assert.match(popup, /We could not confirm your enrollment yet/);
  assert.match(popup, /do not pay again/);
});

test("existing-account buyers go to their dashboard without unnecessary verification email", async () => {
  const signup = await read("src/app/signup/SignupContent.tsx");
  assert.match(signup, /if \(isExistingAccount\) \{\s*setPurchaseStep\("existing-complete"\)/);
  assert.match(signup, /window\.location\.replace\("\/dashboard"\)/);
  const popup = await read("src/app/signup/_components/PurchaseStatusDialog.tsx");
  assert.match(popup, /Enrollment successful!/);
  assert.match(popup, /Opening your dashboard/);
});

test("login displays persistent inbox and spam reminder and offers resend when not verified", async () => {
  const login = await read("src/app/login/page.tsx");
  assert.match(login, /new URLSearchParams\(window\.location\.search\)\.get\("verify"\) === "1"/);
  assert.match(login, /showVerificationReminder/);
  assert.match(login, /Payment completed\? Verify your email first/);
  assert.match(login, /Spam, Junk and Promotions/);
  assert.match(login, /sendEmailVerification\(credential.user\)/);
  assert.match(login, /setShowVerificationReminder\(true\)/);
  assert.match(login, /Another verification email was requested/);
  assert.match(login, /If needed, try again in a few minutes/);
});

test("payment acceptance and plan authorization remain server verified", async () => {
  const fresh = await read("src/app/api/payment/verify/route.ts");
  const existing = await read("src/app/api/payment/existing/verify/route.ts");
  for (const route of [fresh, existing]) {
    assert.match(route, /razorpay\.orders\.fetch/);
    assert.match(route, /razorpay\.payments\.fetch/);
    assert.match(route, /timingSafeEqual/);
    assert.match(route, /Number\(payment\.amount\) !== expectedAmount/);
  }
  const loginSession = await read("src/app/api/auth/session/route.ts");
  assert.match(loginSession, /decoded\.email_verified/);
});
