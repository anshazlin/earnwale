"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SiteNavbar from "@/app/components/SiteNavbar";

const faqs = [
  {
    q: "Does this course give stock recommendations?",
    a: "No. Earnwale Trading Academy provides beginner financial education, not stock tips, personalized advice or guaranteed returns.",
  },
  {
    q: "Do I have to buy a course to join the Affiliate Program?",
    a: "No. The Affiliate Program is free and separate from course enrollment. Commission is earned only from qualifying verified course sales.",
  },
  {
    q: "Is there refund?",
    a: "Refunds are handled as per our Refund Policy. Please read the policy before purchasing.",
  },
  {
    q: "How do affiliate commissions work?",
    a: "Starter costs ₹1 and does not earn an affiliate commission. Active affiliates may earn ₹400 on a qualifying ₹500 Pro sale. Self-referrals, affiliate recruitment and guaranteed earnings are not allowed.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#courses") return;
    requestAnimationFrame(() => {
      document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);


  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteNavbar />

      {/* 2. Hero */}
      <div className="mx-auto w-full max-w-screen-md px-4 py-6">
      <section className="py-6 sm:py-10">
        <div className="w-full max-w-full">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl lg:text-4xl">
              Understand Stock Markets. Learn Trading Fundamentals.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
              Learn market basics, candlesticks, chart reading, risk and trading psychology with six videos, fictional examples and practice activities.
            </p>
            <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:justify-center">
              <Link
                href="/signup?plan=300"
                className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-amber-600 sm:w-auto sm:px-6"
              >
                Enroll Now
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
      <section id="courses" className="scroll-mt-16 border-t border-amber-50 bg-amber-50/30 py-6 sm:py-10">
        <div className="w-full max-w-full">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-600 sm:text-base">
            Choose Starter for ₹1 or Pro for ₹500. Both are one-time educational course purchases with access after verified payment.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 rounded-xl bg-[#071B33] p-5 text-white"><p className="text-xs font-bold tracking-[0.16em] text-amber-300">EARNWALE TRADING ACADEMY</p><p className="mt-2 text-xl font-bold">Starter: Trading Fundamentals</p><p className="text-sm text-blue-100">6 videos • 44 min 44 sec</p></div>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Starter Plan</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">₹1</p>
              <p className="mt-1 text-sm font-medium text-amber-700">
                Learn how markets operate, interpret charts and understand trading risk.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700 sm:mt-6 sm:space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Six lessons • 44 min 44 sec of video
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Beginner handbook and practice worksheets
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> 8-question knowledge check with fresh questions each attempt
                </li>
              </ul>
              <Link href="/signup?plan=300" className="mt-5 block w-full rounded-xl border-2 border-amber-500 bg-white py-3 text-center text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50 sm:mt-6 sm:py-4">Enroll in Starter — ₹1</Link>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:ring-2 sm:ring-amber-200">
              <div className="mb-4 rounded-xl bg-slate-100 p-5"><p className="text-xs font-bold tracking-[0.16em] text-slate-500">EARNWALE TRADING ACADEMY</p><p className="mt-2 text-xl font-bold text-slate-900">Pro: Practical Trading Education</p><p className="text-sm text-slate-600">Six new Pro lessons and five PDFs uploaded to private storage</p></div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pro enrollment open</p>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">Pro Plan</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">₹500</p>
              <p className="mt-1 text-sm font-medium text-amber-700">
                Pro includes Starter plus six extra lessons, practical case studies and a separate 8-question rotating knowledge check. Includes practical exercises, case studies and review activities.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700 sm:mt-6 sm:space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Starter access plus six additional Pro video lessons
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Five Pro PDFs including workbook, case studies and journal
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">✔</span> Rotating 8-question Pro assessment with saved scores
                </li>
              </ul>
              <Link href="/signup?plan=500" className="mt-5 block w-full rounded-xl border-2 border-amber-500 bg-white py-3 text-center text-sm font-semibold text-amber-700 hover:bg-amber-50 sm:mt-6 sm:py-4">Enroll in Pro — ₹500</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-6 sm:py-10">
        <div className="w-full max-w-full">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            How It Works
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
                Enroll in Starter to access videos, PDFs and a knowledge check after successful payment.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">Access Your Learning</h3>
              <p className="mt-2 text-sm text-gray-600">
                Successful enrollment unlocks only the course content included in your selected plan.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 sm:text-lg">Apply What You Learn</h3>
              <p className="mt-2 text-sm text-gray-600">
                Review fictional market examples, complete the worksheets and take a short assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-amber-100 py-6 sm:py-10">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
            Separate and optional
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">
            Earnwale Affiliate Program
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Joining the Affiliate Program is free and does not require a course purchase.
            Affiliates earn only from genuine qualifying course sales through their tracked link.
            There are no recruitment commissions, downlines or guaranteed earnings.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">₹1 Starter sale</p>
              <p className="mt-1 text-xl font-bold text-slate-950">No affiliate commission</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold text-slate-500">₹500 Pro qualifying sale</p>
              <p className="mt-1 text-xl font-bold text-slate-950">₹400 commission</p>
            </div>
          </div>
          <Link
            href="/affiliate"
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Learn about the Affiliate Program
          </Link>
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
                Digital educational resources designed for ambitious students. Learn once, apply for life.
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
                <li>
                  <Link href="/affiliate" className="text-sm text-gray-600 hover:text-amber-600">Affiliate Program</Link>
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
                <li>
                  <Link href="/affiliate-terms" className="text-sm text-gray-600 hover:text-amber-600">Affiliate Terms</Link>
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
