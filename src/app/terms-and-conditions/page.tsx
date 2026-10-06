import type { Metadata } from "next";
import LegalLayout from "@/app/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | Earnwale",
  description: "Terms governing Earnwale digital courses, accounts, payments and referral rewards.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout title="Terms & Conditions">
      <p className="text-sm text-gray-500">Last Updated: October 2026</p>
      <p className="mt-4">These Terms govern access to Earnwale, its digital educational products, accounts, wallet and promotional referral program. By completing the required acceptance checkboxes and purchasing or using the Platform, you agree to these Terms and the Refund and Privacy Policies.</p>

      <h2>1. Nature of Earnwale</h2>
      <p>Earnwale is a digital education platform. A purchase is consideration for the selected educational product/course and access to that product. Earnwale is not an investment, deposit, savings, lending, gambling, employment, franchise, get-rich-quick or guaranteed-income scheme.</p>
      <p>Referral rewards, where offered, are promotional incentives incidental to genuine course sales. A user is not promised any return merely for paying a joining or course fee, and no user is required to recruit another person to access the purchased course.</p>

      <h2>2. Eligibility and Accounts</h2>
      <ul>
        <li>You must be at least 18 years old and legally capable of entering into a contract.</li>
        <li>You must use a valid email address and provide truthful information requested by the Platform.</li>
        <li>One person may maintain only one account unless Earnwale gives written permission.</li>
        <li>You must protect your password and promptly report suspected unauthorized access.</li>
        <li>You may not impersonate another person, use stolen payment credentials, or create accounts to manipulate referrals, rewards, refunds or withdrawals.</li>
      </ul>

      <h2>3. Digital Course Licence</h2>
      <p>After successful payment verification, Earnwale grants the purchaser a limited, personal, non-exclusive and non-transferable right to access the purchased digital course, subject to these Terms. Course material may not be unlawfully copied, resold, redistributed, scraped, publicly uploaded or shared using another person's account.</p>

      <h2>4. Prices and Payments</h2>
      <p>Prices displayed at checkout are in INR unless stated otherwise. The price shown and accepted at checkout applies to that transaction. Payments are processed through the displayed payment provider. Earnwale will not intentionally store card numbers, CVV or banking passwords.</p>
      <p>A payment confirmation does not validate fraud, a duplicate charge, an unauthorized transaction or a technical error. Such matters will be handled under the Refund Policy and applicable law.</p>

      <h2>5. Referral Program and Earnings</h2>
      <p>Participation is optional. Referral rewards are not guaranteed income, interest, investment returns or wages. Eligibility and reward amounts are determined by the program terms displayed by Earnwale and may be subject to verification of a genuine qualifying purchase.</p>
      <p>Users must not:</p>
      <ul>
        <li>self-refer, create fake/duplicate accounts, fabricate transactions or collude to generate rewards;</li>
        <li>spam, harass, misrepresent Earnwale, or use deceptive advertisements;</li>
        <li>promise guaranteed earnings, fixed returns, employment, investment profits or recovery of the purchase price through referrals;</li>
        <li>represent themselves as Earnwale employees, agents or authorized financial advisers unless expressly authorized in writing;</li>
        <li>use unlawful, stolen or unauthorized payment instruments or identities.</li>
      </ul>
      <p>Earnwale may withhold, reverse or freeze a disputed reward where there is a documented basis to suspect fraud, duplicate credit, refunded/reversed qualifying payment or violation of these Terms. Legitimately earned, undisputed amounts will not be forfeited merely because an account is closed.</p>

      <h2>6. Wallet and Withdrawals</h2>
      <p>The Earnwale wallet records eligible promotional referral rewards. It is not a bank account, deposit account, stored-value investment or assurance of future income. Withdrawal requests may be subject to eligibility thresholds, identity/payment verification, fraud checks, applicable taxes and lawful compliance requirements disclosed by Earnwale.</p>

      <h2>7. Prohibited Conduct</h2>
      <p>You may not use Earnwale for fraud, money laundering, identity theft, unauthorized payments, phishing, malware, illegal content, harassment, infringement, manipulation of the referral system, circumvention of security controls, or any activity prohibited by applicable law.</p>
      <p>Earnwale may preserve relevant records and cooperate with payment providers, regulators or law-enforcement authorities where required or permitted by law.</p>

      <h2>8. Suspension, Investigation and Termination</h2>
      <p>Earnwale may temporarily restrict an account or transaction where reasonably necessary to investigate suspected fraud, security incidents, payment disputes or material violations. Where practicable and lawful, the user will be informed of the reason and given a reasonable opportunity to contact support. Permanent termination will not extinguish mandatory consumer rights or lawful claims to undisputed amounts.</p>

      <h2>9. Refunds, Cancellations and Chargebacks</h2>
      <p>The Refund & Cancellation Policy forms part of these Terms. Nothing in these Terms excludes a refund, remedy or consumer right that cannot lawfully be excluded. Users should contact Earnwale promptly about duplicate charges, failed access, unauthorized transactions or material defects before initiating a payment dispute where reasonably possible.</p>

      <h2>10. Intellectual Property</h2>
      <p>Earnwale content, branding and original materials are protected by applicable intellectual-property laws. No ownership is transferred by purchase. This clause does not restrict rights granted by applicable law.</p>

      <h2>11. Educational and Earnings Disclaimer</h2>
      <p>Course content is provided for education and general information. Earnwale does not guarantee examination results, employment, business success, financial returns, referral conversions or any level of earnings. Users should not treat course or referral content as personalized investment, legal, tax or financial advice.</p>

      <h2>12. Liability and Consumer Rights</h2>
      <p>To the maximum extent permitted by applicable law, Earnwale is not responsible for losses caused solely by events outside its reasonable control. Nothing in these Terms excludes or limits liability or remedies where exclusion or limitation is prohibited by law, including rights arising from fraud, wilful misconduct, deficient services, unfair trade practices or other non-excludable consumer protections.</p>

      <h2>13. Privacy and Security</h2>
      <p>Personal data is handled in accordance with the Privacy Policy and applicable Indian law. Users must not attempt to access another person's account or data. Earnwale may implement reasonable technical and organizational safeguards and fraud monitoring.</p>

      <h2>14. Changes to Terms</h2>
      <p>Earnwale may update these Terms prospectively for legal, security, operational or service changes. Material changes will be communicated reasonably. Changes will not retrospectively remove accrued mandatory consumer rights. Where fresh consent is legally required, Earnwale will seek it.</p>

      <h2>15. Governing Law and Disputes</h2>
      <p>These Terms are governed by the laws of India. Parties should first attempt good-faith resolution through Earnwale's grievance channel. Nothing here restricts a consumer from approaching a competent Consumer Commission, regulator, court or other forum available under applicable law.</p>

      <h2>16. Grievance and Contact</h2>
      <p>Customer/legal support: support@earnwale.com</p>
      <p>Earnwale must publish its legal entity/business name, geographic address and designated grievance contact details on the Platform before production launch where required by applicable law. Until those verified details are supplied, this clause must not be treated as a substitute for statutory disclosures.</p>

      <h2>17. Severability</h2>
      <p>If any provision is held invalid or unenforceable, it will be limited to the minimum extent necessary and the remaining provisions will continue to apply, subject always to mandatory law.</p>
    </LegalLayout>
  );
}
