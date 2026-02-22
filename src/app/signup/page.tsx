"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

export default function SignupPage() {
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

  const handleChange = (e: any) => {
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
        headers: {
          "Content-Type": "application/json",
        },
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
        name: "Earnwale",
        description: "Course Purchase",
        order_id: data.id,

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
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

            // SUCCESS → now redirect
            window.location.href = "/login";
          } catch (error) {
            console.error("Verification error:", error);
            alert("Something went wrong during verification.");
          }
        },

        theme: {
          color: "#f59e0b",
        },
      };
      if (!(window as any).Razorpay) {
        alert("Razorpay not loaded. Refresh and try again.");
        setLoading(false);
        return;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed.");
    }

    setLoading(false);
  };
  
  const inputBase =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30";

  const products = [
    {
      id: "300",
      title: "Earnwale eBook – Starter",
      description: "Learn referral strategy and start earning.",
      price: "₹300",
    },
    {
      id: "500",
      title: "Earnwale eBook – Pro",
      description: "Learn referral strategy and start earning.",
      price: "₹500",
    },
  ];

  const selectedProduct = products.find((p) => p.id === form.plan) ?? products[0];
  const selectedPrice = form.plan === "300" ? "₹300" : "₹500";
  const canSubmit = termsAgreed && refundAgreed;

  return (
    <div className="min-h-screen bg-slate-50">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <nav className="sticky top-0 z-10 h-16 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-base font-semibold text-gray-900">
            Earnwale
          </Link>
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Home
            </Link>
            <Link href="/courses" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Courses
            </Link>
            <Link href="/about" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Contact Us
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              Enroll Now
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div
        className={`transition-opacity duration-300 ease-out ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col lg:flex-row">
          {/* Left: form card – compact, everything in one scrollable area */}
          <div className="flex-1 overflow-y-auto p-4 lg:flex lg:items-start lg:justify-center lg:p-6">
            <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
              {/* Product choice – compact row */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                {products.map((product) => {
                  const selected = form.plan === product.id;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setForm({ ...form, plan: product.id })}
                      className={`rounded-xl border bg-white p-3 text-left shadow-sm transition-all hover:scale-[1.01] hover:shadow sm:p-4 ${
                        selected
                          ? "border-amber-500 shadow-md shadow-amber-500/15"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                        {product.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">{product.description}</p>
                      <p className="mt-2 text-lg font-bold text-gray-900">{product.price}</p>
                    </button>
                  );
                })}
              </div>

              {/* Selected package – inside card */}
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2">
                <p className="text-xs font-medium text-gray-600">Your Selected Package</p>
                <p className="text-base font-semibold text-gray-900">{selectedPrice}</p>
              </div>

              <h2 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg">
                Create Account
              </h2>

              {/* Form – tighter spacing, two columns on sm+ where it helps */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
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
                <div className="sm:col-span-2">
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
                <div className="sm:col-span-2">
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

              {/* User agreement – inside form card, above button */}
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
                    <a href="/terms" className="font-medium text-amber-600 underline hover:no-underline">
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
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-500/30 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing…
                  </span>
                ) : (
                  "Enroll Now"
                )}
              </button>
            </div>
          </div>

          {/* Right: course / illustration – course appears here */}
          <div className="hidden min-h-[320px] flex-shrink-0 flex-col justify-center bg-gradient-to-br from-amber-100 to-orange-100 p-6 lg:flex lg:w-[42%] lg:min-h-[calc(100vh-3.5rem)] lg:p-8">
            <div className="mx-auto w-full max-w-sm">
              <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-6 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80">
                  Your course
                </p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900">
                  {selectedProduct.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{selectedProduct.description}</p>
                <p className="mt-4 text-2xl font-bold text-gray-900">{selectedProduct.price}</p>
              </div>
              <div className="mt-6 flex aspect-video items-center justify-center rounded-2xl border border-amber-200/40 bg-white/60">
                <span className="text-sm font-medium text-amber-800/50">Course preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
