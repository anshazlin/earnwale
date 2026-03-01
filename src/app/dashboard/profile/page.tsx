"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    upiId: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            upiId: data.upiId || "",
            bankName: data.bankName || "",
            accountNumber: data.accountNumber || "",
            ifscCode: data.ifscCode || "",
          });
        }
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      alert("Payout details updated");
    } else {
      alert(data.error || "Failed");
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Payout Details
      </h1>

      <div className="space-y-4 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <input
          placeholder="UPI ID"
          value={form.upiId}
          onChange={(e) => setForm({ ...form, upiId: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-2"
        />

        <input
          placeholder="Bank Name"
          value={form.bankName}
          onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-2"
        />

        <input
          placeholder="Account Number"
          value={form.accountNumber}
          onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-2"
        />

        <input
          placeholder="IFSC Code"
          value={form.ifscCode}
          onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-4 py-2"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-white hover:bg-amber-600"
        >
          {loading ? "Saving..." : "Save Details"}
        </button>
      </div>
    </div>
  );
}