import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("friend invites use a 256-bit secret, hashed Firestore ID, single-use redemption", async () => {
  const helper = await read("src/lib/friend-pro-invite.ts");
  assert.match(helper, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.match(helper, /createHash\("sha256"\)/);
  assert.match(helper, /update\("earnwale:friend-pro-invite:v1:"\)/);
  assert.match(helper, /FRIEND_PRO_PRICE_PAISE = 100/);
  assert.match(helper, /FRIEND_PRO_PLAN = "500"/);
  assert.match(helper, /INVITE_DURATION_MS = 3 \* 24 \* 60 \* 60 \* 1000/);
  assert.match(helper, /invite\.email !== email/);
  assert.match(helper, /status: "redeemed"/);
  assert.match(helper, /redeemedBy: userId/);
  assert.match(helper, /reserveFriendInvite/);
  assert.match(helper, /tx\.friendInvite\.update/);
  assert.match(helper, /current\.orderId !== orderId/);
  assert.match(helper, /orderedAt > expiredAt/);
  const store = await read("src/lib/prisma.ts");
  assert.match(store, /"friendInvites"/);
  assert.match(store, /friendInvite = this\.collection\("friendInvites"\)/);
  assert.match(store, /friendInvite: model\("friendInvites"\)/);
});

test("only verified admins can issue or revoke email-bound friend invites", async () => {
  const admin = await read("src/app/api/admin/friend-invites/route.ts");
  const ui = await read("src/app/admin/friend-invites/page.tsx");
  const sidebar = await read("src/app/admin/_components/sidebar.tsx");
  assert.match(admin, /await requireAdmin\(request\)/);
  assert.match(admin, /isSameOriginRequest/);
  assert.match(admin, /consumeRateLimit/);
  assert.match(admin, /normalizedInviteEmail\(body\?\.email\)/);
  assert.match(admin, /createFriendInvite\(email\)/);
  assert.match(admin, /invite\.orderId/);
  assert.match(admin, /tx\.friendInvite\.update/);
  assert.match(ui, /Generate one-time ₹1 Pro link/);
  assert.match(ui, /\/api\/admin\/friend-invites/);
  assert.match(ui, /Copy invitation link/);
  assert.match(sidebar, /href: "\/admin\/friend-invites"/);
});

test("public invitation check does not expose email or skip private media readiness", async () => {
  const status = await read("src/app/api/academy/friend-invite/route.ts");
  assert.match(status, /findAvailableFriendInvite/);
  assert.match(status, /valid: true, plan: "500", amount: 100/);
  assert.doesNotMatch(status, /email: record\.email/);
  const order = await read("src/app/api/payment/create-order/route.ts");
  const existing = await read("src/app/api/payment/existing/create-order/route.ts");
  for (const file of [order, existing]) {
    assert.match(file, /findAvailableFriendInvite/);
    assert.match(file, /friendInvite \? 100 : checkoutAmountForPlan\(plan\)/);
    assert.match(file, /friendInvite && !enrollmentFlagEnabled|!friendInvite && !enrollmentFlagEnabled/);
    assert.match(file, /verifiedCourseAssetsReady\(selectedPlan\)/);
    assert.match(file, /friendInviteId: friendInvite\?\.id/);
    assert.match(file, /recipientEmail: friendInvite\?\.email/);
    assert.match(file, /reserveFriendInvite\(friendInvite\.id, order\.id/);
    assert.match(file, /razorpay\.orders\.fetch\(friendInvite\.orderId\)/);
    assert.match(file, /friendInvite \? "" :/);
  }
});

test("₹1 Pro grants full Pro plan only after authenticated Razorpay payment with no referral rewards", async () => {
  const newVerify = await read("src/app/api/payment/verify/route.ts");
  const existingVerify = await read("src/app/api/payment/existing/verify/route.ts");
  for (const file of [newVerify, existingVerify]) {
    assert.match(file, /friendInviteFromOrder\(order,/);
    assert.match(file, /friendInvite \? 100 : catalogAmount/);
    assert.match(file, /Number\(payment\.amount\) !== expectedAmount/);
    assert.match(file, /Number\(order\.amount\) !== expectedAmount/);
    assert.match(file, /safeSignatureEqual/);
    assert.match(file, /redeemFriendInviteInTransaction\(tx, friendInvite/);
    assert.match(file, /friendInvite \? null : await resolveActiveAffiliate/);
    assert.match(file, /friendDiscount: Boolean\(friendInvite\)/);
    assert.match(file, /await prisma\.\$transaction/);
  }
  const signup = await read("src/app/signup/SignupContent.tsx");
  assert.match(signup, /searchParams\.get\("invite"\)/);
  assert.match(signup, /\/api\/academy\/friend-invite\?invite=/);
  assert.match(signup, /friendInviteToken \|\| undefined/);
  assert.match(signup, /Pay ₹1 and activate Pro/);
  assert.match(signup, /invitedPro && form\.plan === "500" \? "₹1"/);
  assert.match(signup, /const friendUpgrade = invitedPro && existingPlan === "300"/);
  assert.match(signup, /!friendInvite\.loading/);
  const pro = await read("src/lib/pro-course.ts");
  assert.match(pro, /trim\(\) === "500"/);
});
