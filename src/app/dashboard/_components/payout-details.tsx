"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PayoutDetails() {
  const router = useRouter();
  const [upiId, setUpiId] = useState("");
  const [confirmUpiId, setConfirmUpiId] = useState("");
  const [payoutVerified, setPayoutVerified] = useState(false);
  const [payoutVerifiedAt, setPayoutVerifiedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/profile", {
      credentials: "include",
      cache: "no-store",
    })
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
          setPayoutVerified(Boolean(data?.payoutVerified));
          setPayoutVerifiedAt(
            data?.payoutVerifiedAt
              ? new Date(data.payoutVerifiedAt).toISOString()
              : null,
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: "Unable to load payout details.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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
      if (!res.ok) {
        throw new Error(data?.error || "Unable to save payout details");
      }

      setUpiId(normalized);
      setConfirmUpiId(normalized);
      setPayoutVerified(Boolean(data?.payoutVerified));
      setMessage({
        type: "success",
        text: "UPI saved. Your first successful manually checked payout will verify and lock it.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Unable to save payout details.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Payout account</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your withdrawal UPI is bound to your account after the first successful payout check.
          </p>
        </div>
        <span
          className={
            payoutVerified
              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800"
              : "rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
          }
        >
          {payoutVerified ? "Verified & locked" : upiId ? "Pending verification" : "Not set"}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 h-28 animate-pulse rounded-2xl bg-slate-100" />
      ) : payoutVerified ? (
        <div className="mt-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Bound UPI ID
            </p>
            <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-950">
              {upiId}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">✓</span>
              Verified after successful manual payout
            </div>
            {payoutVerifiedAt && (
              <p className="mt-2 text-[11px] text-emerald-700">
                Verified {new Date(payoutVerifiedAt).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>

          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            This payout account is locked for your protection. If you genuinely need to change it, contact support so the old binding can be reviewed first.
          </p>
          <Link
            href="/dashboard/support"
            className="mt-3 inline-flex rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"
          >
            Contact support
          </Link>
        </div>
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
            <p
              className={
                message.type === "success"
                  ? "text-xs font-medium text-emerald-700"
                  : "text-xs font-medium text-rose-700"
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {saving ? "Saving…" : upiId ? "Save payout UPI" : "Set payout UPI"}
          </button>

          <div className="rounded-2xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">
            Use a UPI ID in your own name. On your first withdrawal, Earnwale manually checks the beneficiary name before payment. After a successful payout, this UPI becomes verified and locked.
          </div>
        </form>
      )}
    </section>
  );
}
