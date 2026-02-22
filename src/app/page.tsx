"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "Is this legal?",
    a: "Yes. Earnwale operates within applicable laws. Referral rewards are paid for genuine course referrals as per our terms.",
  },
  {
    q: "When do I get paid?",
    a: "Earnings are credited to your account when a referred user completes purchase. Payouts are processed as per our policy.",
  },
  {
    q: "Is there refund?",
    a: "Refunds are handled as per our Refund Policy. Please read the policy before purchasing.",
  },
  {
    q: "Can I refer myself?",
    a: "No. Self-referrals are not allowed. Only genuine referrals to other people qualify for rewards.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            Earnwale
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Earn by Referring. Simple.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Buy our digital course once. Share your referral code. Earn on every successful referral.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex rounded-xl bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-amber-600"
              >
                Start Earning Now
              </Link>
              <Link
                href="/login"
                className="inline-flex rounded-xl border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:border-amber-500 hover:text-amber-600"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="h-64 w-64 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg sm:h-80 sm:w-80 lg:h-96 lg:w-96" />
          </div>
        </div>
      </section>

      {/* 3. Plans */}
      <section className="border-t border-amber-50 bg-amber-50/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-gray-600">
            One-time purchase. Lifetime access. Earn on every referral.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-md sm:p-8">
              <h3 className="text-xl font-semibold text-gray-900">Starter Plan</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">₹300</p>
              <p className="mt-1 text-sm text-amber-700 font-medium">Earn ₹250 per referral</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500">✔</span> Instant access to ebook
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500">✔</span> Personal referral code
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500">✔</span> Lifetime access
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-xl border-2 border-amber-500 bg-white py-3 text-center font-semibold text-amber-600 transition-colors hover:bg-amber-50"
              >
                Get Started
              </Link>
            </div>
            <div className="rounded-2xl border-2 border-amber-400 bg-white p-6 shadow-lg ring-2 ring-amber-200 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Popular</p>
              <h3 className="text-xl font-semibold text-gray-900">Pro Plan</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">₹500</p>
              <p className="mt-1 text-sm text-amber-700 font-medium">Earn ₹450 per referral</p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500">✔</span> Instant access to ebook
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500">✔</span> Personal referral code
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-amber-500">✔</span> Lifetime access
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-6 block w-full rounded-xl bg-amber-500 py-3 text-center font-semibold text-white shadow-md transition-colors hover:bg-amber-600"
              >
                Start Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            How Earnwale Works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Buy Course</h3>
              <p className="mt-2 text-sm text-gray-600">
                Choose a plan and get instant access to the ebook. One-time purchase.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Share Referral Code</h3>
              <p className="mt-2 text-sm text-gray-600">
                Share your unique code with friends. They sign up and purchase using it.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Earn Rewards</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get paid for every successful referral. Track earnings in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Earnings Example */}
      <section className="border-t border-amber-50 bg-amber-50/50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Your Earning Potential
          </h2>
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-md sm:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm">
                <span className="text-gray-700">Refer 5 people (₹300 plan)</span>
                <span className="font-bold text-amber-700">Earn ₹1,250</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm">
                <span className="text-gray-700">Refer 10 people (₹500 plan)</span>
                <span className="font-bold text-amber-700">Earn ₹4,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-900 hover:bg-amber-50/50"
                >
                  {faq.q}
                  <span className="text-amber-600">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-amber-50 px-5 py-4 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Secure Payment */}
      <section className="border-t border-amber-100 bg-amber-50/50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-6 py-5 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-800 sm:text-base">
              All payments are processed securely via Razorpay. Earnwale does not support offline payments.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Earnwale</p>
              <p className="mt-2 text-sm text-gray-600">
                Buy once. Refer unlimited. Earn on every successful referral with our digital course.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Quick Links</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/signup" className="text-sm text-gray-600 hover:text-amber-600">Signup</Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-gray-600 hover:text-amber-600">Login</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Policy</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-amber-600">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="text-sm text-gray-600 hover:text-amber-600">Refund Policy</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Earnwale. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
