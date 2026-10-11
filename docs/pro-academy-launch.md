# Earnwale Trading Academy — ₹500 Pro staging and launch gates

## Scope
Pro **includes** the six existing Starter videos and introduces six additional fictional educational videos: chart timeframes, evidence and scenarios, sizing/cost/gap arithmetic, paper-journal simulation, case-study review, and investor safety. Its five learner PDFs are a Pro Handbook, Pro Workbook, Paper Practice Journal, Case Study Cards and Sample Practice Questions. The final Pro knowledge quiz draws **eight random questions from a 36-question bank**, covers all six lesson topics, shows one question per screen, and grades server-side at 7/8 with saved Firestore attempt history.

This implements the three Pro themes in the original Earnwale course blueprint as six lesson videos. The user still needs to generate the six MP4s from the delivered NotebookLM-ready PDF scripts. Target lesson durations are editorial targets, not verified video runtimes.

## Authoring pack, kept out of GitHub
The package delivered in ChatGPT contains six numbered source PDFs and corresponding Markdown, combined scripts, a NotebookLM guide, five learner PDFs and restricted instructor assessment/solution keys. **Never upload an instructor answer key as a student download or NotebookLM student source.** Course PDF files are uploaded as private Vercel Blob objects after review.

## Storage names and privacy

The existing private Vercel Blob store is shared with Starter. Pro pathnames are independent:
- Videos: `earnwale/pro/module-1.mp4` ... `earnwale/pro/module-6.mp4`.
- PDFs: `earnwale/pro/handbook.pdf`, `workbook.pdf`, `journal.pdf`, `cases.pdf`, `practice.pdf`.
- Firestore courseAssets IDs: `pro-module-1` ... `pro-module-6`, `pro-handbook`, `pro-workbook`, `pro-journal`, `pro-cases`, `pro-practice`.

Admin upload and preview: `/admin/pro-assets`, `/api/admin/pro-assets`, `/api/admin/pro-preview`. Admin routes verify Firebase admin session and the private Blob origin, and check the object with `head()`.

Pro learner: `/dashboard/pro`. Pro-only `/api/pro/media` streams private objects using authentication. Pro-only `/api/pro/quiz` signs question-set tokens, selects distinct prompts, and stores server-graded history in `courseAttempts` as courseId `trading-pro-v1`. The Starter assessment history is filtered to courseId `trading-starter-v1`. Existing Starter documents and purchases are not changed.

## Current release state
- Six Pro video **scripts** exist and are educationally drafted. **Six Pro MP4s do NOT exist yet.**
- Pro learner PDFs have been authored but require owner review and upload.
- Code can be deployed safely while Pro checkout remains closed.
- `POST /api/payment/create-order` still blocks `plan === "500"` with HTTP 409.
- Signup form continues to disable ₹500 Pro; homepage identifies Pro as Coming Soon.
- Existing `500` plan users (if any) can access Pro learning routes; that is not permission to enable new sales.
- Price and referral economics for ₹500 are **not approved**.

## Manual prelaunch gate
1. Generate each module MP4 separately from its matching source PDF in NotebookLM.
2. Review every minute, particularly numerical examples and fabricated chart labels. Do not assume NotebookLM reads scripts verbatim.
3. Upload P01–P06 and five PDFs through `/admin/pro-assets`, check 11/11 verified.
4. Test Pro admin preview of six videos and PDFs, including mobile playback, seeking, file start and finish.
5. Test a plan-500 learner and a plan-300 learner: Pro user can stream and take the rotating quiz; Starter-only must receive 403.
6. Verify quiz 8/8 questions with each major topic represented, last-eight exclusions, Back/Next, after-submit reviews, saved courseId, retakes, and rejected duplicate/tampered submissions.
7. Review actual video rights, consumer disclosures/refunds, tax/pricing, Indian securities-education compliance and referral margins.
8. **Only after all of the above**, explicitly decide whether to enable Pro checkout. Keep plan-500 order creation blocked until then.

## Risk and references
This is educational material, not personal investment advice, trade signals, a professional credential, or assured returns. All practice companies and prices are invented.

- [SEBI Investor Charter](https://investor.sebi.gov.in/Investor-charter.html)
- [SEBI investor education](https://investor.sebi.gov.in/)
- [SEBI learning materials](https://investor.sebi.gov.in/iematerial.html)
- [SEBI video learning and fraud warnings](https://investor.sebi.gov.in/inv_aware_edu_videos.html)
