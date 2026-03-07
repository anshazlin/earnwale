import type { Metadata } from "next";
import LegalLayout from "@/app/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | Earnwale",
  description: "Terms and conditions for using Earnwale website, products, services, and referral program.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout title="Terms & Conditions">
      <p className="text-sm text-gray-500">Last Updated: March 2026</p>
      <p className="mt-4">
        Welcome to Earnwale. These Terms & Conditions (&quot;Terms&quot;) govern your access to and use of the Earnwale website, products, services, courses, and referral program.
      </p>
      <p>
        By accessing or using Earnwale, you agree to be legally bound by these Terms.
      </p>
      <p>
        If you do not agree, please do not use our services.
      </p>

      <h2>1. Definitions</h2>
      <p>&quot;Platform&quot; refers to the Earnwale website and services.</p>
      <p>&quot;User&quot; refers to any individual accessing or using Earnwale.</p>
      <p>&quot;Plan&quot; refers to any paid digital product, course, or program offered by Earnwale.</p>
      <p>&quot;Referral Program&quot; refers to the reward-based partner system offered by Earnwale.</p>
      <p>&quot;Wallet&quot; refers to the internal earnings system within Earnwale.</p>

      <h2>2. Eligibility</h2>
      <p>To use Earnwale services:</p>
      <ul>
        <li>You must be at least 18 years of age.</li>
        <li>You must provide accurate and complete information during registration.</li>
        <li>You must not create multiple accounts.</li>
        <li>You must comply with all applicable laws in your jurisdiction.</li>
      </ul>
      <p>Earnwale reserves the right to suspend accounts that violate eligibility rules.</p>

      <h2>3. Account Registration & Security</h2>
      <ul>
        <li>Users are responsible for maintaining confidentiality of login credentials.</li>
        <li>Users are responsible for all activity under their account.</li>
        <li>Earnwale is not liable for unauthorized access due to user negligence.</li>
        <li>You must immediately notify us of any suspected account breach.</li>
      </ul>
      <p>We reserve the right to suspend or terminate accounts suspected of fraudulent activity.</p>

      <h2>4. Digital Products & Course Access</h2>
      <ul>
        <li>All products sold on Earnwale are digital.</li>
        <li>Access is granted after successful payment confirmation.</li>
        <li>Users are granted a limited, non-transferable, non-exclusive license to access content.</li>
        <li>Redistribution, resale, copying, or sharing of content is strictly prohibited.</li>
      </ul>
      <p>Violation may result in permanent account termination and legal action.</p>

      <h2>5. Pricing & Payments</h2>
      <ul>
        <li>All prices are listed in INR.</li>
        <li>Prices may change at any time without prior notice.</li>
        <li>Payment must be completed through approved payment gateways.</li>
        <li>Access is granted only after successful payment verification.</li>
      </ul>
      <p>Earnwale is not responsible for payment failures due to banking or gateway issues.</p>

      <h2>6. Referral & Partner Program</h2>
      <p>Participation in the referral program is voluntary. Users agree:</p>
      <ul>
        <li>Not to engage in self-referrals.</li>
        <li>Not to create fake or duplicate accounts.</li>
        <li>Not to use spam or misleading marketing tactics.</li>
        <li>Not to make false income claims on behalf of Earnwale.</li>
      </ul>
      <p>Earnwale reserves the right to:</p>
      <ul>
        <li>Cancel fraudulent rewards.</li>
        <li>Freeze wallet balances.</li>
        <li>Permanently suspend accounts.</li>
      </ul>
      <p>Referral rewards are not guaranteed income.</p>

      <h2>7. Earnings Disclaimer</h2>
      <p>Earnwale does not guarantee:</p>
      <ul>
        <li>Any specific earnings.</li>
        <li>Any income level.</li>
        <li>Referral conversions.</li>
        <li>Business success.</li>
      </ul>
      <p>Your results depend entirely on your effort, strategy, and market conditions.</p>

      <h2>8. Intellectual Property</h2>
      <p>All content including course materials, website design, logos, branding, text, and graphics are the intellectual property of Earnwale and protected by applicable copyright laws. Unauthorized use may result in legal action.</p>

      <h2>9. Limitation of Liability</h2>
      <p>Earnwale shall not be liable for indirect losses, lost profits, business interruption, data loss, payment gateway failures, or technical downtime. Use of the platform is at your own risk.</p>

      <h2>10. Termination</h2>
      <p>We may suspend or terminate your access without prior notice if:</p>
      <ul>
        <li>You violate these Terms.</li>
        <li>Fraudulent activity is detected.</li>
        <li>Abuse of the referral system is found.</li>
      </ul>
      <p>Termination may result in forfeiture of wallet balance.</p>

      <h2>11. Modifications</h2>
      <p>Earnwale reserves the right to update these Terms at any time. Continued use after updates constitutes acceptance.</p>

      <h2>12. Governing Law</h2>
      <p>These Terms shall be governed by the laws of India.</p>

      <h2>13. Contact</h2>
      <p>For legal inquiries: support@earnwale.com</p>
    </LegalLayout>
  );
}
