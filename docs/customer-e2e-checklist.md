# Earnwale customer end-to-end checklist

Run only against a development/test deployment with the guarded test seed. Never use a real Razorpay payment.

## Setup
- Set test-environment Firebase server credentials.
- Set `EARNWALE_TEST_EMAIL` to a clearly identifiable test address containing `test`.
- Set `EARNWALE_TEST_PASSWORD` locally/secretly; never commit it.
- Set `ALLOW_EARNWALE_TEST_SEED=YES` and run `npm run seed:test-user`.
- Confirm the Firestore user has `isTest: true` and `testDataLabel: DEVELOPMENT_TEST_ONLY`.

## Auth
- Login with the test account.
- Logout and confirm protected routes redirect to login.
- Try an invalid password and confirm no session is created.
- Exercise email verification with a disposable test account.
- Request forgot-password email and complete reset.
- Confirm direct protected URL access works only with a valid verified session.

## Dashboard
- Confirm available balance, referral earnings, referral count, latest withdrawal and recent transactions match seeded backend data.
- Confirm skeleton, empty and error states render without layout overflow.
- Record initial request count and verify the dashboard uses one customer dashboard data request after layout authentication.

## Wallet / transactions
- Confirm balance is authoritative and unchanged by navigation.
- Verify Previous/Next pagination and browser back/forward.
- Confirm mobile rows do not overflow.

## Referrals
- Confirm referral code/link, count and total earned.
- Copy the referral link and verify its `ref` parameter.
- Verify paginated referred-member history.

## Withdrawals
- Confirm history pagination.
- Confirm minimum ₹450, maximum ₹4500, one-pending-request rule and 24-hour rule remain enforced by the server.
- Test insufficient balance in test data.
- For a successful workflow, use test data only; do not transfer money.
- After a confirmed server response, verify UI refreshes authoritative balance/history.

## Profile / courses / navigation
- Confirm profile loads and password change requires the current Firebase password.
- Confirm plan-based course access still matches the existing plan.
- Test Dashboard → Wallet → Transactions → Referrals → Withdrawals → Profile.
- Test direct URLs, refresh, browser back and forward.

## Responsive
Check approximately 390px mobile, 768px tablet and 1440px desktop widths. Confirm tap targets, bottom navigation, cards, pagination and transaction/withdrawal rows are usable with no horizontal overflow.

## Validation before merge
- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Existing Vercel preview deployment must pass.
- Do not merge if any required check fails.
