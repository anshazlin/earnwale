import type { Metadata } from "next";
import LegalLayout from "@/app/components/LegalLayout";

export const metadata: Metadata = {
  title: "Affiliate Program Terms | Earnwale",
  description: "Terms for the optional Earnwale Affiliate Program.",
};

export default function AffiliateTermsPage() {
  return (
    <LegalLayout title="Affiliate Program Terms">
      <p className="text-sm text-gray-500">Version: 14 October 2026</p>
      <p className="mt-4">
        These terms govern participation in the optional Earnwale Affiliate Program.
        The Affiliate Program is separate from purchasing an Earnwale course.
      </p>

      <h2>1. Free and Optional Participation</h2>
      <p>
        Joining the Affiliate Program is free. Buying a course is not required to become
        an affiliate, and buying a course does not automatically make a customer an affiliate.
        A person may be a customer only, an affiliate only, or both.
      </p>

      <h2>2. Qualifying Course Sales</h2>
      <p>
        Commission is earned only when a different customer completes a genuine qualifying
        Earnwale course purchase through the affiliate&apos;s tracked link and the payment is
        successfully verified by Earnwale&apos;s payment system.
      </p>
      <ul>
        <li>No commission is paid on a ₹1 Starter course sale.</li>
        <li>₹400 for a qualifying ₹500 Pro course sale.</li>
        <li>No commission is paid for registering an affiliate or creating an account.</li>
        <li>No commission is paid for recruiting another affiliate.</li>
        <li>No commission is paid on self-referrals.</li>
        <li>There are no multi-level, downline, binary or matrix commissions.</li>
      </ul>

      <h2>3. Reversals and Payment Disputes</h2>
      <p>
        A commission tied solely to a purchase may be withheld or reversed if that purchase
        is refunded, reversed, duplicated, fraudulent or charged back, subject to applicable
        law and Earnwale&apos;s documented records. Unrelated legitimate commissions are not
        forfeited merely because another transaction is disputed.
      </p>

      <h2>4. Marketing Rules</h2>
      <p>Affiliates must market Earnwale truthfully and must not:</p>
      <ul>
        <li>promise guaranteed income, fixed earnings or guaranteed trading profits;</li>
        <li>claim a purchaser will recover the course price by referring other people;</li>
        <li>represent the Affiliate Program as employment, investment, deposit or guaranteed return;</li>
        <li>make false claims about course content, approvals, registrations or government endorsement;</li>
        <li>send unlawful spam, impersonate Earnwale, or use misleading advertisements;</li>
        <li>offer personalized investment advice or trading signals on Earnwale&apos;s behalf unless separately authorized and legally permitted.</li>
      </ul>

      <h2>5. Tracking and Attribution</h2>
      <p>
        Affiliates receive a unique tracked link after activation. Earnwale uses server-side
        payment and account records to determine qualifying attribution. Manipulation of links,
        duplicate accounts, fabricated payments or collusion may result in withholding or
        reversal of affected commissions after review.
      </p>

      <h2>6. Wallet and Withdrawals</h2>
      <p>
        Affiliate commissions are recorded in the Earnwale wallet. The wallet is not a bank,
        deposit or investment account. The current minimum withdrawal is ₹250, subject to
        payout verification, fraud controls, applicable taxes and lawful compliance requirements.
      </p>

      <h2>7. Taxes and Records</h2>
      <p>
        Affiliates are responsible for providing truthful payout information and for complying
        with tax obligations that apply to them. Earnwale may retain payment, commission and
        payout records where reasonably necessary for accounting, disputes, fraud prevention
        and legal compliance.
      </p>

      <h2>8. Suspension or Termination</h2>
      <p>
        Earnwale may suspend an affiliate account or affected commission where there is a
        documented basis to investigate fraud, self-referral, payment abuse, deceptive promotion
        or a material breach of these terms. Mandatory consumer and payment rights remain unaffected.
      </p>

      <h2>9. Changes</h2>
      <p>
        Earnwale may update the program prospectively for legal, security or commercial reasons.
        Material changes should be communicated reasonably and fresh consent should be obtained
        where required by applicable law.
      </p>

      <h2>10. Legal Review and Contact</h2>
      <p>
        These Affiliate Terms form part of Earnwale&apos;s contractual documentation and must
        be read with the Terms & Conditions, Privacy Policy and Refund Policy. Participation is
        subject to applicable Indian law.
      </p>
      <p>Program support: support@earnwale.com</p>
    </LegalLayout>
  );
}
