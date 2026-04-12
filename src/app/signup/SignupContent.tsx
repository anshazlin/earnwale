"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import SiteNavbar from "@/app/components/SiteNavbar";
import { useSearchParams } from "next/navigation";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export default function SignupContent() {
  const searchParams = useSearchParams();
  const referralFromUrl = searchParams.get("ref");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    state: "",
    dob: "",
    password: "",
    referralCode: "",
    plan: "300",
  });

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [refundAgreed, setRefundAgreed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (referralFromUrl) {
      setForm((prev) => ({
        ...prev,
        referralCode: referralFromUrl,
      }));
    }
  }, [referralFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("Fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Failed to create order");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "Earnwale Learning",
        description: "Digital Course Enrollment",
        order_id: data.id,
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                formData: form,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              alert(verifyData.error || "Payment verification failed");
              setLoading(false);
              return;
            }

            window.location.href = "/login";
          } catch (error) {
            console.error("Verification error:", error);
            alert("Something went wrong during verification.");
          }
        },
        theme: { color: "#f59e0b" },
      };

      if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
          alert("Payment system not ready. Please refresh.");
          setLoading(false);
          return;
        }
      }

      const rzp = new (window as unknown as {
        Razorpay: new (o: unknown) => { open: () => void };
      }).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed.");
    }

    setLoading(false);
  };

  const inputBase =
    "w-full max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 box-border";

  const products = [
    {
      id: "300",
      title: "The Scholar's Protocol",
      description: "Advanced Cognitive Strategies for High-Performance Learning",
      price: "₹300",
      image: "/images/scholar.jpg",
    },
    {
      id: "500",
      title: "The Capital Compounder",
      description: "Advanced Financial Engineering for the Modern Student",
      price: "₹500",
      image: "/images/capital.jpg",
    },
  ];

  const selectedProduct = products.find((p) => p.id === form.plan) ?? products[0];
  const canSubmit = termsAgreed && refundAgreed;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <SiteNavbar />

      <div className={mounted ? "opacity-100" : "opacity-0"}>
        <div className="mx-auto w-full max-w-screen-md px-4 py-6">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-700">
            Digital Course Enrollment
          </p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            Learn, practice, and build skills &mdash; not a get-rich scheme.
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Earnwale provides educational content only. We do not offer investment advice, income guarantees, or promises of returns.
          </p>

          {/* Selected Plan */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Selected Plan
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div className="hidden w-full max-w-full sm:block">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.title}
                  width={400}
                  height={250}
                  className="w-full max-w-full h-auto rounded-xl object-cover"
                  priority
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedProduct.title}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedProduct.description}
                </p>
                <p className="mt-4 text-2xl font-bold text-gray-900">
                  {selectedProduct.price}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {products.map((product) => {
                    const selected = form.plan === product.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setForm({ ...form, plan: product.id })}
                        className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                          selected
                            ? "border-amber-500 bg-amber-50 text-amber-800"
                            : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {product.price}
                        <span className="mt-0.5 block text-xs font-medium text-gray-500">
                          {product.id === "300" ? "Core" : "Extended"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Create Account Form */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Create your learning account
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="mobile" className="mb-1 block text-xs font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={form.mobile}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="state" className="mb-1 block text-xs font-medium text-gray-700">
                  State
                </label>
                <input
                  id="state"
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="dob" className="mb-1 block text-xs font-medium text-gray-700">
                  Date of birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
              <div>
                <label htmlFor="referralCode" className="mb-1 block text-xs font-medium text-gray-700">
                  Referral code <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  placeholder="Referral Code (Optional)"
                  value={form.referralCode}
                  onChange={handleChange}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-gray-700">
                  I agree with{" "}
                  <a href="/terms-and-conditions" className="font-medium text-amber-600 underline hover:no-underline">
                    Terms & Conditions
                  </a>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={refundAgreed}
                  onChange={(e) => setRefundAgreed(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-gray-700">
                  I have read the{" "}
                  <a href="/refund-policy" className="font-medium text-amber-600 underline hover:no-underline">
                    Refund Policy
                  </a>
                </span>
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !canSubmit}
              className="mt-4 w-full max-w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing…
                </span>
              ) : (
                "Complete Secure Payment"
              )}
            </button>

            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              This is a one-time digital course purchase. Access is granted immediately after successful payment. Referral rewards, if applicable, are
              promotional incentives and not guaranteed income.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
