"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Script from "next/script";
import SiteNavbar from "@/app/components/SiteNavbar";
import { useSearchParams } from "next/navigation";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type AccountSummary = {
  id: string;
  email: string;
  name?: string;
  plan?: string | number | null;
};

export default function SignupContent() {
  const searchParams = useSearchParams();
  const affiliateFromUrl =
    searchParams.get("aff") ?? searchParams.get("ref") ?? "";

  const [form, setForm] = useState({
    email: "",
    password: "",
    affiliateCode: "",
    plan: "300",
  });
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [accountChecked, setAccountChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [refundAgreed, setRefundAgreed] = useState(false);
  const [availability, setAvailability] = useState({
    starter: false,
    pro: false,
    loading: true,
  });

  useEffect(() => {
    setMounted(true);
    let alive = true;

    Promise.all([
      fetch("/api/academy/enrollment-status", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) throw new Error("Enrollment unavailable");
          return res.json();
        })
        .then((data) => {
          if (alive) {
            setAvailability({
              starter: data.starter === true,
              pro: data.pro === true,
              loading: false,
            });
          }
        })
        .catch(() => {
          if (alive) {
            setAvailability({ starter: false, pro: false, loading: false });
          }
        }),
      fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      })
        .then(async (res) => {
          if (res.status === 401 || res.status === 403) return null;
          if (!res.ok) throw new Error("Account lookup failed");
          const data = await res.json();
          return (data?.user ?? null) as AccountSummary | null;
        })
        .then((user) => {
          if (alive) setAccount(user);
        })
        .catch(() => {
          if (alive) setAccount(null);
        })
        .finally(() => {
          if (alive) setAccountChecked(true);
        }),
    ]);

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const requested = searchParams.get("plan");
    if (requested === "500" && availability.pro) {
      setForm((current) => ({ ...current, plan: "500" }));
    } else if (requested === "300" && availability.starter) {
      setForm((current) => ({ ...current, plan: "300" }));
    }
  }, [searchParams, availability.pro, availability.starter]);

  useEffect(() => {
    if (affiliateFromUrl) {
      setForm((current) => ({
        ...current,
        affiliateCode: affiliateFromUrl.trim().toUpperCase(),
      }));
    }
  }, [affiliateFromUrl]);

  const existingPlan = String(account?.plan ?? "").trim();
  const isExistingAccount = Boolean(account);
  const selectedAvailable =
    form.plan === "500" ? availability.pro : availability.starter;
  const canSubmit =
    accountChecked &&
    termsAgreed &&
    refundAgreed &&
    selectedAvailable &&
    !availability.loading &&
    !existingPlan;

  const products = [
    {
      id: "300",
      title: "Earnwale Trading Academy — Starter",
      description:
        "Six video lessons (44:44), beginner handbook, worksheets and an 8-question rotating knowledge check.",
      price: "₹300",
    },
    {
      id: "500",
      title: "Earnwale Trading Academy — Pro",
      description:
        "Includes Starter plus six additional Pro lessons, five practical PDFs and a separate rotating 8-question Pro assessment.",
      price: "₹500",
    },
  ];

  const selectedProduct =
    products.find((product) => product.id === form.plan) ?? products[0];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handlePayment = async () => {
    if (!selectedAvailable) {
      alert("This course is not open for new enrollment yet.");
      return;
    }
    if (existingPlan) {
      alert("This account already owns a course.");
      return;
    }
    if (!isExistingAccount && (!form.email.trim() || form.password.length < 8)) {
      alert("Enter a valid email and a password with at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const orderEndpoint = isExistingAccount
        ? "/api/payment/existing/create-order"
        : "/api/payment/create-order";

      const orderRes = await fetch(orderEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan: form.plan,
          affiliateCode: form.affiliateCode.trim().toUpperCase(),
        }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        alert(order?.error || "Unable to start checkout");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Earnwale Learning",
        description: "Digital Course Enrollment",
        order_id: order.id,
        prefill: {
          email: account?.email ?? form.email.trim().toLowerCase(),
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyEndpoint = isExistingAccount
              ? "/api/payment/existing/verify"
              : "/api/payment/verify";

            const verifyBody = isExistingAccount
              ? {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: form.plan,
                }
              : {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  formData: {
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    plan: form.plan,
                    affiliateCode: form.affiliateCode.trim().toUpperCase(),
                  },
                };

            const verifyRes = await fetch(verifyEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(verifyBody),
            });
            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              alert(verifyData?.error || "Payment verification failed");
              setLoading(false);
              return;
            }

            if (isExistingAccount) {
              window.location.href = "/dashboard";
              return;
            }

            try {
              const {
                signInWithEmailAndPassword,
                sendEmailVerification,
                signOut,
              } = await import("firebase/auth");
              const { firebaseAuth } = await import("@/lib/firebase-client");
              const credential = await signInWithEmailAndPassword(
                firebaseAuth,
                form.email.trim().toLowerCase(),
                form.password,
              );
              if (!credential.user.emailVerified) {
                await sendEmailVerification(credential.user);
              }
              await signOut(firebaseAuth);
            } catch (authError) {
              console.error("Verification email setup failed:", authError);
            }

            window.location.href = "/login?verify=1";
          } catch (error) {
            console.error("Verification error:", error);
            alert("Something went wrong during payment verification.");
            setLoading(false);
          }
        },
        theme: { color: "#f59e0b" },
      };

      if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
          alert("Payment system not ready. Please refresh.");
          return;
        }
      }

      const razorpay = new (window as unknown as {
        Razorpay: new (options: unknown) => { open: () => void };
      }).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 box-border";

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <SiteNavbar />

      <div className={mounted ? "opacity-100" : "opacity-0"}>
        <div className="mx-auto w-full max-w-screen-md px-4 py-6">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-700">
            Digital Course Enrollment
          </p>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">
            Buy the course for the learning product itself.
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Earnwale provides educational content only. Choose the course you
            want to study and complete secure enrollment below.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Selected course
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <div className="rounded-xl bg-[#071B33] p-4 text-white">
                <p className="text-xs font-bold tracking-[0.16em] text-amber-300">
                  EARNWALE TRADING ACADEMY
                </p>
                <p className="mt-2 text-base font-bold">
                  Trading Education
                </p>
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
                    const available =
                      product.id === "500"
                        ? availability.pro
                        : availability.starter;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        disabled={availability.loading || !available}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            plan: product.id,
                          }))
                        }
                        className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                          selected
                            ? "border-amber-500 bg-amber-50 text-amber-800"
                            : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {product.price}
                        <span className="mt-0.5 block text-xs font-medium text-gray-500">
                          {availability.loading
                            ? "Checking…"
                            : available
                              ? "Available"
                              : "Coming soon"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              {isExistingAccount
                ? "Use your existing account"
                : "Create your learning account"}
            </h2>

            {!accountChecked ? (
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
            ) : isExistingAccount ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {`Signed in as ${account?.email ?? ""}`}
                </p>
                {existingPlan ? (
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    This account already has course access for plan ₹{existingPlan}.
                    Course upgrades are not handled by this checkout.
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    No paid course is attached to this account. You can enroll
                    now without creating a second account.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-xs font-medium text-gray-700"
                  >
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
                  <label
                    htmlFor="password"
                    className="mb-1 block text-xs font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    className={inputBase}
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <label
                htmlFor="affiliateCode"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Affiliate code <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="affiliateCode"
                name="affiliateCode"
                placeholder="Affiliate Code (Optional)"
                value={form.affiliateCode}
                onChange={handleChange}
                className={inputBase}
              />
              <p className="mt-1 text-[11px] leading-5 text-gray-500">
                This only attributes a genuine course sale to an active
                affiliate. It does not change your price or course access.
              </p>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(event) => setTermsAgreed(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-gray-700">
                  I agree with{" "}
                  <a
                    href="/terms-and-conditions"
                    className="font-medium text-amber-600 underline hover:no-underline"
                  >
                    Terms & Conditions
                  </a>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={refundAgreed}
                  onChange={(event) => setRefundAgreed(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-gray-700">
                  I have read the{" "}
                  <a
                    href="/refund-policy"
                    className="font-medium text-amber-600 underline hover:no-underline"
                  >
                    Refund Policy
                  </a>
                </span>
              </label>
            </div>

            {existingPlan ? (
              <a
                href="/dashboard"
                className="mt-4 flex w-full items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-800"
              >
                Return to dashboard
              </a>
            ) : (
              <button
                onClick={handlePayment}
                disabled={loading || !canSubmit}
                className="mt-4 w-full max-w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Processing…"
                  : selectedAvailable
                    ? "Complete Secure Payment"
                    : "Enrollment coming soon"}
              </button>
            )}

            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              Course purchases are one-time educational enrollments. Access is
              granted only after successful payment verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
