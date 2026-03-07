import type { Metadata } from "next";
import LegalLayout from "@/app/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Earnwale",
  description: "How Earnwale collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="text-sm text-gray-500">Last Updated: March 2026</p>
      <p className="mt-4">
        Earnwale respects your privacy and is committed to protecting your personal information.
      </p>
      <p>
        This Privacy Policy explains how we collect, use, and safeguard your data.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect:</p>
      <h3>Personal Information</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>UPI ID (for payouts)</li>
      </ul>
      <h3>Account Information</h3>
      <ul>
        <li>Login credentials</li>
        <li>Referral data</li>
        <li>Wallet earnings</li>
        <li>Transaction history</li>
      </ul>
      <h3>Technical Information</h3>
      <ul>
        <li>IP address</li>
        <li>Device type</li>
        <li>Browser type</li>
        <li>Usage behavior</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use collected data to:</p>
      <ul>
        <li>Create and manage user accounts</li>
        <li>Process payments</li>
        <li>Credit referral rewards</li>
        <li>Process payouts</li>
        <li>Prevent fraud</li>
        <li>Improve platform performance</li>
        <li>Communicate service updates</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2>3. Payment Processing</h2>
      <p>Payments are processed through third-party payment gateways. Earnwale does not store card numbers, CVV, or banking passwords. All payment data is handled securely by authorized payment providers.</p>

      <h2>4. Data Security</h2>
      <p>We implement reasonable security measures to protect your data. However, no system is 100% secure. Use of the platform is at your own risk.</p>

      <h2>5. Cookies & Tracking</h2>
      <p>We may use cookies to improve user experience, track login sessions, and monitor referral attribution. You can disable cookies through your browser settings.</p>

      <h2>6. Data Sharing</h2>
      <p>We may share data only with payment processors, with legal authorities when required by law, and to prevent fraud or abuse. We do not sell or rent user information.</p>

      <h2>7. Data Retention</h2>
      <p>We retain user data as long as necessary to maintain accounts, comply with legal obligations, and resolve disputes. Users may request account deletion via support email.</p>

      <h2>8. User Rights</h2>
      <p>You may request access to your data, correction of inaccurate data, or account deletion. Contact: support@earnwale.com</p>

      <h2>9. Policy Updates</h2>
      <p>We may update this Privacy Policy periodically. Continued use implies acceptance.</p>
    </LegalLayout>
  );
}
