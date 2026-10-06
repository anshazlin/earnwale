import type { Metadata } from "next";
import LegalLayout from "@/app/components/LegalLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Earnwale",
  description: "Refund and cancellation policy for Earnwale digital educational products.",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy">
      <p className="text-sm text-gray-500">Last Updated: October 2026</p>
      <p className="mt-4">Earnwale sells digital educational products. This policy explains when a purchase is ordinarily non-cancellable and when a refund or other remedy may still apply. Nothing in this policy limits rights or remedies that cannot lawfully be excluded under applicable Indian law.</p>

      <h2>1. Digital Access and Change-of-Mind Requests</h2>
      <p>Because digital course access may be made available immediately after verified payment, a change-of-mind request ordinarily will not qualify for a refund once access has been successfully supplied and the product is materially as described. This does not apply where a refund or remedy is required by law or under the exceptions below.</p>

      <h2>2. Refund or Correction Cases</h2>
      <p>Earnwale will investigate requests involving:</p>
      <ul>
        <li>duplicate payment for the same intended purchase;</li>
        <li>payment captured but purchased access not supplied within a reasonable time;</li>
        <li>a persistent technical defect attributable to Earnwale that materially prevents access and cannot reasonably be remedied;</li>
        <li>an incorrect amount charged by Earnwale;</li>
        <li>an unauthorized transaction, subject to payment-provider/bank verification and applicable law;</li>
        <li>a product or service materially different from what was represented at the time of purchase; or</li>
        <li>any other case in which a refund, replacement, correction or remedy is required by applicable law.</li>
      </ul>

      <h2>3. How to Raise a Request</h2>
      <p>Contact support@earnwale.com as soon as reasonably possible with the account email, payment/order identifier, date, amount and a short description of the issue. Do not send card numbers, CVV, banking passwords, OTPs or other authentication secrets.</p>
      <p>Earnwale may request information reasonably necessary to verify the transaction and resolve the complaint. A request will not be rejected solely because it falls outside an arbitrary internal period where applicable law provides a right or remedy.</p>

      <h2>4. Processing</h2>
      <p>Approved refunds will ordinarily be returned through the original payment method where technically and legally feasible. Banking/payment-network processing times may apply after Earnwale initiates the refund. Earnwale will not impose an undisclosed refund charge.</p>

      <h2>5. Referral Reward Reversal</h2>
      <p>If a qualifying purchase is validly refunded, reversed, duplicated, fraudulent or charged back, any referral reward generated solely by that transaction may be reversed. Earnwale will not confiscate unrelated, legitimately earned and undisputed rewards merely because another transaction is refunded.</p>

      <h2>6. Chargebacks and Payment Disputes</h2>
      <p>A chargeback will not automatically be treated as fraud. Earnwale may temporarily restrict the disputed transaction or associated reward while a genuine payment dispute is investigated. Deliberate chargeback abuse, use of stolen payment instruments or fabricated disputes may result in account restrictions and lawful recovery action.</p>

      <h2>7. Cancellation</h2>
      <p>Before payment is completed, a user may abandon checkout without purchasing. After immediate digital access has been supplied, cancellation for convenience is ordinarily unavailable, subject to the exceptions and mandatory rights described above.</p>

      <h2>8. Grievances and Statutory Rights</h2>
      <p>Billing/refund support: support@earnwale.com</p>
      <p>Nothing in this policy prevents a consumer from using a grievance mechanism, Consumer Commission, regulator, court or other remedy available under applicable law. Earnwale must publish the legally required business and grievance-officer particulars once those verified details are available.</p>
    </LegalLayout>
  );
}
