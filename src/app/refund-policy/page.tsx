import type { Metadata } from "next";
import LegalLayout from "@/app/components/LegalLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Earnwale",
  description: "Earnwale refund and cancellation policy for digital products.",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout title="Refund & Cancellation Policy">
      <p className="text-sm text-gray-500">Last Updated: March 2026</p>
      <p className="mt-4">All products sold on Earnwale are digital products.</p>

      <h2>1. No Refund Policy</h2>
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="font-semibold text-amber-900">No Refund on Digital Products</p>
        <p className="mt-2 text-gray-700">
          Due to the digital nature of our products:
        </p>
        <ul className="mt-2 list-disc pl-6">
          <li>All sales are final.</li>
          <li>No refunds will be provided once access is granted.</li>
          <li>No cancellations are allowed after purchase.</li>
        </ul>
        <p className="mt-2 text-gray-700">
          By purchasing, you acknowledge and agree to this policy.
        </p>
      </div>

      <h2>2. Exceptional Cases</h2>
      <p>Refunds may be considered only if:</p>
      <ul>
        <li>Duplicate payment occurred.</li>
        <li>Payment was deducted but access was not granted.</li>
        <li>Technical issue prevented access and could not be resolved.</li>
      </ul>
      <p>All refund decisions are at Earnwale&apos;s sole discretion.</p>

      <h2>3. Referral Earnings & Refunds</h2>
      <p>If a referred user requests a refund (if approved), the corresponding referral reward will be reversed and wallet balance may be adjusted accordingly.</p>

      <h2>4. Chargebacks</h2>
      <p>If a user initiates a chargeback:</p>
      <ul>
        <li>Account may be suspended.</li>
        <li>Wallet balance may be frozen.</li>
        <li>Access to products may be revoked.</li>
      </ul>

      <h2>5. Contact for Billing Issues</h2>
      <p>For billing concerns: support@earnwale.com</p>
    </LegalLayout>
  );
}
