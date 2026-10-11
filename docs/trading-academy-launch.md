# Earnwale Trading Academy — release checklist (October 2026)

## Change status
This branch stages a replacement for the old Scholar's Protocol / Capital Compounder PDF cards. It does not deliver video bytes; **DO NOT MERGE TO PRODUCTION** until asset hosting, the offer descriptions, course access and legal review are complete.

## Source mapping (uploaded customer videos)
1. Introduction to Financial Markets — VID-20261010-WA0025(1).mp4 — 6:48
2. How Stock Markets Work — VID-20261011-WA0037.mp4 — 7:21
3. Understanding Candlestick Charts — VID-20261011-WA0038.mp4 — 7:25
4. Support, Resistance and Trends — VID-20261011-WA0039.mp4 — 8:23
5. Risk Management and Position Sizing — VID-20261011-WA0040.mp4 — 7:32
6. Trading Psychology and Common Mistakes — VID-20261011-WA0044.mp4 — 7:15

VID-20261011-WA0042.mp4 (Decoding the Trading Hype) was sent by mistake and must NOT be used in the six-module Starter course.

Total video runtime approximately 44:44, **not 120 minutes**.

## Staged Starter launch: no customers yet
- Per founder's report, there are no real customers. This removes the production customer-data migration need, but do not assume seeded/test accounts are nonexistent.
- Draft catalog now advertises Starter as 44:44 of video plus a handbook, worksheets and a quiz. Pro remains shown at ₹500 as a future offering, but new Pro orders are denied server-side.
- **Do not accept Starter payments until delivery works**. The order endpoint now requires `EARNWALE_STARTER_ENROLLMENT_ENABLED=true` (unset/false defaults to closed). Set this only after assets are deployed and purchase-to-dashboard delivery is tested.
- The existing business logic credits ₹250 referral reward for a ₹300 purchase and ₹450 for ₹500; each leaves ₹50 before fees, taxes, refunds and overhead. Review/refactor referral economics and refund reversal before launch.
- Current Pro payment verification remains able to verify any previously issued/paid order, if one exists, but new Pro order creation is blocked.
- The website checkout descriptions no longer refer to the retired eBooks.

## Required media hosting
Upload six MP4 files to a streaming-capable private or signed media service. Do NOT commit large MP4s to Git or rely on Vercel function ephemeral storage. Configure these **server-only** environment variables after hosting:
- EARNWALE_TRADING_VIDEO_1_URL through EARNWALE_TRADING_VIDEO_6_URL
- EARNWALE_TRADING_HANDBOOK_URL (PDF)
- EARNWALE_TRADING_WORKBOOK_URL (PDF)

Use immutable, access-controlled sources. The current proxy accepts HTTPS asset URLs; it **does not yet implement provider-authenticated private storage** and is not a DRM solution. Check origin access, response sizes, range requests, buffering and serverless bandwidth. For production traffic, replace the proxy with a signed short-lived origin URL or streaming CDN if appropriate.

PDFs from this conversation are downloadable separately. The old PDF files and old download route are removed on this branch; the newer PDFs have NOT been uploaded to hosting.

## Quiz and UX
- 20 questions; server-side answers only, grading at POST /api/trading/quiz.
- Students must submit all questions; pass threshold 16/20; explanations shown after submission.
- Score is session-only in the browser; there is **no persistent database completion record or certificate**, and retakes use the same question bank.
- Use preload="none" so only one chosen video may load at a time.
- Access is verified using the existing Firebase/session + database plan (300 or 500).

## Before merging
1. Verify course content against actual narration, especially numbers, risks, legal claims and module 6.
2. Have trading educator and India securities-compliance reviewer approve materials.
3. Upload and test all six videos and the two learner PDF resources.
4. Separate educator answer keys from student resources as desired; do not publish the assessment answer-key PDF.
5. Update homepage and checkout offer copy to state the **real 44:44 runtime** and exactly what ₹300 vs ₹500 buys. Pro-specific materials are not delivered in this branch. Avoid selling undisclosed Pro extras.
6. Consider existing customers' rights: removing PDFs that customers previously purchased may require maintaining grandfathered access or providing suitable remedy. Confirm migration policy before releasing.
7. Test logged-out, no-plan, ₹300 and ₹500 sessions; mobile playback, range seeking, quiz, and 403/410 responses.
8. Run npm ci, npm run typecheck, npm run lint, npm run test and npm run build, and verify Vercel preview deployment.
