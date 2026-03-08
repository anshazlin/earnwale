"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen overflow-x-hidden">
      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4 sm:h-16">
          <Link href="/" className="text-base font-semibold text-gray-900 sm:text-lg">
            Earnwale
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 sm:px-4"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero */}
      <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <section className="py-6 sm:py-10">
        <div className="w-full max-w-full">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl">
              Earn by Referring. Simple.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
              Buy our digital course once. Share your referral code. Earn on every successful referral.
            </p>
            <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-amber-600 sm:w-auto sm:px-6"
              >
                Start Earning Now
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-gray-300 px-4 py-3 text-base font-semibold text-gray-700 transition-colors hover:border-amber-500 hover:text-amber-600 sm:w-auto sm:px-6"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Plans */}
      <section className="border-t border-amber-50 bg-amber-50/30 py-6 sm:py-10">
        <div className="w-full max-w-full">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-600 sm:text-base">
            One-time purchase. Lifetime access to premium learning content.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 hidden sm:block">
                <Image
                  src="/images/scholar.jpg"
                  alt="The Scholar's Protocol course cover"
                  width={600}
                  height={380}
                  className="w-full max-w-full h-auto rounded-xl object-cover"
                  priority
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Starter Plan</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">₹300</p>
              <p className="mt-1 text-sm font-medium text-amber-700">
                Core foundations for focused, high-performance learning.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700 sm:mt-6 sm:space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Instant access to ebook
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Structured, step-by-step learning roadmap
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Lifetime access and updates
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-5 block w-full rounded-xl border-2 border-amber-500 bg-white py-3 text-center text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50 sm:mt-6 sm:py-4"
              >
                Get Started
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:ring-2 sm:ring-amber-200">
              <div className="mb-4 hidden sm:block">
                <Image
                  src="/images/capital.jpg"
                  alt="The Capital Compounder course cover"
                  width={600}
                  height={380}
                  className="w-full max-w-full h-auto rounded-xl object-cover"
                  priority
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Popular</p>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Pro Plan</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">₹500</p>
              <p className="mt-1 text-sm font-medium text-amber-700">
                Advanced systems for mastering money and decision-making.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700 sm:mt-6 sm:space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Everything in Starter, plus advanced modules
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Practical frameworks and implementation guides
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Lifetime access and updates
                </li>
              </ul>
              <Link
                href="/signup"
                className="mt-5 block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-amber-600 sm:mt-6 sm:py-4"
              >
                Start Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-6 sm:py-10">
        <div className="w-full max-w-full">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            How Earnwale Works
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">Buy Course</h3>
              <p className="mt-2 text-sm text-gray-600">
                Choose a plan and get instant access to the ebook. One-time purchase.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">Share Referral Code</h3>
              <p className="mt-2 text-sm text-gray-600">
                Share your unique code with friends. They sign up and purchase using it.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">Earn Rewards</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get paid for every successful referral. Track earnings in your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Earnings Example */}
      <section className="border-t border-amber-50 bg-amber-50/30 py-6 sm:py-10">
        <div className="w-full max-w-full">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
            Your Earning Potential
          </h2>
          <div className="mt-6 w-full max-w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
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
      <section className="py-6 sm:py-10">
        <div className="w-full max-w-full">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="w-full max-w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
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
      <section className="border-t border-amber-50 bg-amber-50/30 py-6">
        <div className="w-full max-w-full">
          <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-sm font-medium text-gray-800 sm:text-base">
              All payments are processed securely via Razorpay. Earnwale does not support offline payments.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="w-full max-w-full">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-base font-semibold text-gray-900">Earnwale</p>
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
                  <Link href="/terms-and-conditions" className="text-sm text-gray-600 hover:text-amber-600">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-amber-600">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="text-sm text-gray-600 hover:text-amber-600">Refund Policy</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Earnwale. All rights reserved.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
