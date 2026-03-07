"use client";

export default function ReferralPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Referral Policy
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Referral & Partner Program terms and conditions.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Last Updated: March 2026</p>
        <p className="text-gray-700">
          Welcome to the Earnwale Referral Program. By participating in our Partner Program, you agree to the following terms and conditions.
        </p>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            1. Eligibility
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
            <li>Participants must be 18 years or older.</li>
            <li>Each user may maintain only one account.</li>
            <li>Earnwale reserves the right to verify identity before approving payouts.</li>
          </ul>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            2. How the Referral Program Works
          </h2>
          <p className="mt-3 text-gray-700">
            When you purchase a plan from Earnwale, you receive a unique referral link. You earn rewards when:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li>A new user signs up using your referral link.</li>
            <li>The referred user successfully purchases a plan.</li>
            <li>The payment is successfully completed and verified.</li>
          </ul>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            3. Referral Rewards
          </h2>
          <p className="mt-3 text-gray-700">
            Earnwale currently offers the following referral rewards:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li><strong>₹250</strong> reward on every successful <strong>₹300</strong> plan referral.</li>
            <li><strong>₹450</strong> reward on every successful <strong>₹500</strong> plan referral.</li>
          </ul>
          <p className="mt-3 text-gray-700">
            Rewards are credited to your Earnwale wallet after payment verification. Earnwale reserves the right to modify reward amounts at any time without prior notice.
          </p>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            4. Wallet & Payout Policy
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
            <li>Referral rewards are credited to your internal wallet.</li>
            <li>Minimum withdrawal amount: <strong>₹500</strong>.</li>
            <li>Payout method: UPI only.</li>
            <li>Users must submit correct UPI details under the KYC & Payout section.</li>
            <li>Payouts are processed manually within 48 hours after approval.</li>
          </ul>
          <p className="mt-3 text-gray-700">
            Earnwale is not responsible for failed payments due to incorrect UPI details submitted by users.
          </p>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            5. Prohibited Activities
          </h2>
          <p className="mt-3 text-gray-700">The following activities are strictly prohibited:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li>Self-referrals (creating fake accounts to earn rewards).</li>
            <li>Multiple accounts operated by the same individual.</li>
            <li>Fake, temporary, or fraudulent payments.</li>
            <li>Misleading, spam, or false promotional practices.</li>
            <li>Impersonating Earnwale or making false income claims.</li>
          </ul>
          <p className="mt-3 text-gray-700">
            If any suspicious activity is detected, wallet balance may be frozen, rewards may be cancelled, and account may be permanently suspended without notice.
          </p>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            6. Fraud Prevention
          </h2>
          <p className="mt-3 text-gray-700">
            Earnwale actively monitors IP addresses, device activity, payment verification logs, and referral patterns. Any attempt to manipulate or exploit the system will result in immediate termination of access and forfeiture of all earnings.
          </p>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            7. Program Changes
          </h2>
          <p className="mt-3 text-gray-700">
            Earnwale reserves the right to modify referral reward amounts, change payout conditions, update program structure, and suspend or terminate the referral program. Updates will be reflected on this page.
          </p>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            8. Limitation of Liability
          </h2>
          <p className="mt-3 text-gray-700">
            Earnwale does not guarantee specific income amounts, referral conversions, or continuous program availability. Earnings depend solely on your marketing efforts and user engagement.
          </p>
        </section>

        <section>
          <h2 className="border-b border-amber-100 pb-2 text-lg font-semibold text-gray-900">
            9. Acceptance of Terms
          </h2>
          <p className="mt-3 text-gray-700">
            By participating in the Earnwale Referral Program, you confirm that you have read and understood this policy, agree to comply with all rules, and accept that violation may result in account suspension.
          </p>
        </section>

        <p className="border-t border-amber-100 pt-4 text-sm text-gray-600">
          If you have any questions, please contact:{" "}
          <a href="mailto:support@earnwale.com" className="font-medium text-amber-600 hover:text-amber-700">
            support@earnwale.com
          </a>
        </p>
      </div>
    </div>
  );
}
