"use client";

import { useCallback, useEffect, useState } from "react";

export default function KycPage() {
  const [form, setForm] = useState({
    fullName: "",
    upiId: "",
    confirmUpiId: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        fullName: data?.name ?? "",
        upiId: data?.upiId ?? "",
        confirmUpiId: data?.upiId ?? "",
      }));
    } catch {
      window.location.href = "/login";
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (form.upiId !== form.confirmUpiId) {
      setMessage({ type: "error", text: "UPI ID and Confirm UPI ID do not match." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.fullName,
          upiId: form.upiId || null,
          bankName: null,
          accountNumber: null,
          ifscCode: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: "error",
          text: data?.error || "Failed to save.",
        });
        return;
      }
      setMessage({ type: "success", text: "Saved successfully." });
      setForm((f) => ({ ...f, confirmUpiId: f.upiId }));
    } catch {
      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

  if (fetchLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          KYC & Payout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your details for payouts.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) =>
              setForm((f) => ({ ...f, fullName: e.target.value }))
            }
            className={inputClass}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            UPI ID
          </label>
          <input
            type="text"
            value={form.upiId}
            onChange={(e) => setForm((f) => ({ ...f, upiId: e.target.value }))}
            className={inputClass}
            placeholder="yourname@upi"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirm UPI ID
          </label>
          <input
            type="text"
            value={form.confirmUpiId}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirmUpiId: e.target.value }))
            }
            className={inputClass}
            placeholder="yourname@upi"
          />
        </div>
        {message && (
          <p
            className={
              message.type === "success"
                ? "text-sm text-emerald-600"
                : "text-sm text-red-600"
            }
          >
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-70"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        <p className="text-xs text-gray-500">
          Payouts are processed manually within 48 hours.
        </p>
      </form>
    </div>
  );
}
