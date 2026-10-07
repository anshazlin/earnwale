"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PayoutDetails() {
  const router = useRouter();
  const [upiId, setUpiId] = useState("");
  const [confirmUpiId, setConfirmUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return null;
        }
        if (!res.ok) throw new Error("Unable to load payout details");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data) {
          const value = String(data?.upiId ?? "");
          setUpiId(value);
          setConfirmUpiId(value);
        }
      })
      .catch(() => {
        if (!cancelled) setMessage({ type: "error", text: "Unable to load payout details." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [router]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const normalized = upiId.trim().toLowerCase();
    if (!normalized || normalized !== confirmUpiId.trim().toLowerCase()) {
      setMessage({ type: "error", text: "UPI IDs must match." });
      return;
    }
    if (!/^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(normalized)) {
      setMessage({ type: "error", text: "Enter a valid UPI ID format." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          upiId: normalized,
          bankName: null,
          accountNumber: null,
          ifscCode: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to save payout details");
      setUpiId(normalized);
      setConfirmUpiId(normalized);
      setMessage({ type: "success", text: "Payout details saved." });
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Unable to save payout details." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Payout details</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Add the UPI ID where approved withdrawals should be sent.
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
          Manual review
        </span>
      </div>

      {loading ? (
        <div className="mt-5 h-28 animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <form onSubmit={save} className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">UPI ID</label>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Confirm UPI ID</label>
            <input
              value={confirmUpiId}
              onChange={(e) => setConfirmUpiId(e.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {message && (
            <p className={message.type === "success" ? "text-xs font-medium text-emerald-700" : "text-xs font-medium text-rose-700"}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save payout details"}
          </button>
          <p className="text-[11px] leading-5 text-slate-500">
            Saving a UPI ID does not verify the account holder identity. Withdrawals remain subject to review until automated beneficiary verification is connected.
          </p>
        </form>
      )}
    </section>
  );
}
