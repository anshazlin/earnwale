"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type WithdrawalStatus = "pending" | "paid" | "rejected" | "approved" | string;

type Withdrawal = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  paymentReference?: string | null;
  paidAt?: string | null;
  adminNote?: string | null;
  payoutUpiId?: string | null;
  payoutName?: string | null;
  payoutMethod?: string | null;
  user: {
    name: string;
    email: string;
    earnings?: number;
    upiId?: string | null;
  };
};

function statusLabel(status: WithdrawalStatus) {
  const value = String(status ?? "").toLowerCase();
  if (value === "paid") return "Paid";
  if (value === "rejected") return "Rejected";
  return "Pending";
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const value = String(status ?? "").toLowerCase();
  const styles =
    value === "paid"
      ? "bg-emerald-100 text-emerald-800"
      : value === "rejected"
        ? "bg-rose-100 text-rose-800"
        : "bg-amber-100 text-amber-900";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>
      {statusLabel(status)}
    </span>
  );
}

const money = (value?: number) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const dateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function AdminWithdrawPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/withdraw/list", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 403) {
        window.location.href = "/dashboard";
        return;
      }
      if (!res.ok) throw new Error("Failed to load withdrawals");

      const data = await res.json();
      setWithdrawals(Array.isArray(data?.withdrawals) ? data.withdrawals : []);
    } catch {
      setError("Unable to load withdrawals. Please try again.");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const pendingCount = useMemo(
    () =>
      withdrawals.filter((item) => {
        const status = String(item.status ?? "").toLowerCase();
        return status === "pending" || status === "approved";
      }).length,
    [withdrawals],
  );

  const copy = async (label: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setError("Copy failed. Press and hold the value to copy it.");
    }
  };

  const updateStatus = async (
    id: string,
    status: "Paid" | "Rejected",
    options?: { paymentReference?: string; adminNote?: string },
  ) => {
    setUpdatingId(id);
    setError(null);

    try {
      const res = await fetch("/api/admin/withdrawal/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id,
          status,
          paymentReference: options?.paymentReference,
          adminNote: options?.adminNote,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (res.status === 403) {
        window.location.href = "/dashboard";
        return;
      }
      if (!res.ok) {
        setError(data?.error ?? "Action failed. Please try again.");
        return;
      }

      setWithdrawals((current) =>
        current.map((withdrawal) =>
          withdrawal.id === id
            ? {
                ...withdrawal,
                status: status.toLowerCase(),
                paymentReference:
                  status === "Paid"
                    ? data?.paymentReference ?? options?.paymentReference ?? null
                    : withdrawal.paymentReference,
                paidAt:
                  status === "Paid"
                    ? data?.paidAt ?? new Date().toISOString()
                    : withdrawal.paidAt,
                adminNote: options?.adminNote || withdrawal.adminNote,
              }
            : withdrawal,
        ),
      );

      if (processingId === id) {
        setProcessingId(null);
        setPaymentReference("");
        setAdminNote("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openProcessor = (id: string) => {
    setError(null);
    setPaymentReference("");
    setAdminNote("");
    setProcessingId((current) => (current === id ? null : id));
  };

  const confirmPaid = async (withdrawal: Withdrawal) => {
    const reference = paymentReference.trim();
    if (reference.length < 3) {
      setError("Paste the UTR / payment reference before confirming the payout.");
      return;
    }
    await updateStatus(withdrawal.id, "Paid", {
      paymentReference: reference,
      adminNote: adminNote.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Manual payout desk
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Withdrawals
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Pay through your normal UPI/bank app, then record the UTR here. Marking a request paid deducts the customer wallet balance.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl bg-amber-100 px-4 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Pending</p>
            <p className="text-lg font-bold text-amber-950">{pendingCount}</p>
          </div>
          <a
            href="/admin"
            className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Admin home
          </a>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        Before paying, open the UPI ID in your payment app and check the displayed beneficiary name against the customer name. This is a manual payout check, not formal KYC.
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-800">No withdrawal requests</p>
          <p className="mt-1 text-xs text-slate-500">New customer requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => {
            const status = String(withdrawal.status ?? "").toLowerCase();
            const isPending = status === "pending" || status === "approved";
            const busy = updatingId === withdrawal.id;
            const isProcessing = processingId === withdrawal.id;
            const upi = withdrawal.payoutUpiId ?? withdrawal.user?.upiId ?? "";
            const payoutName = withdrawal.payoutName ?? withdrawal.user?.name ?? "Customer";

            return (
              <article
                key={withdrawal.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-semibold text-slate-950">
                          {payoutName}
                        </h2>
                        <StatusBadge status={withdrawal.status} />
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {withdrawal.user?.email ?? "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Requested {dateTime(withdrawal.createdAt)}
                      </p>
                    </div>
                    <p className="shrink-0 text-2xl font-bold tracking-tight text-slate-950">
                      {money(withdrawal.amount)}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">UPI payout</p>
                    <p className="mt-1 break-all font-mono text-sm font-semibold text-slate-900">
                      {upi || "No UPI ID saved"}
                    </p>
                    {isPending && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!upi}
                          onClick={() => copy(`${withdrawal.id}:upi`, upi)}
                          className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-40"
                        >
                          {copied === `${withdrawal.id}:upi` ? "UPI copied ✓" : "Copy UPI"}
                        </button>
                        <button
                          type="button"
                          onClick={() => copy(`${withdrawal.id}:amount`, String(withdrawal.amount))}
                          className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950"
                        >
                          {copied === `${withdrawal.id}:amount` ? "Amount copied ✓" : "Copy amount"}
                        </button>
                      </div>
                    )}
                  </div>

                  {status === "paid" && (
                    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                      <p className="text-xs font-semibold text-emerald-900">Payment recorded</p>
                      <p className="mt-1 font-mono text-xs text-emerald-800">
                        Ref: {withdrawal.paymentReference ?? "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-emerald-700">
                        Paid {dateTime(withdrawal.paidAt)}
                      </p>
                    </div>
                  )}

                  {status === "rejected" && withdrawal.adminNote && (
                    <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-800">
                      {withdrawal.adminNote}
                    </div>
                  )}

                  {isPending && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => openProcessor(withdrawal.id)}
                        disabled={!upi || busy}
                        className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-40"
                      >
                        {isProcessing ? "Close payout form" : "I paid this customer"}
                      </button>

                      {isProcessing && (
                        <div className="mt-3 space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-amber-950">
                              UTR / payment reference *
                            </label>
                            <input
                              value={paymentReference}
                              onChange={(event) => setPaymentReference(event.target.value)}
                              placeholder="Paste transaction reference"
                              autoComplete="off"
                              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-amber-950">
                              Admin note (optional)
                            </label>
                            <input
                              value={adminNote}
                              onChange={(event) => setAdminNote(event.target.value)}
                              placeholder="Anything useful for your records"
                              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                            />
                          </div>
                          <p className="text-[11px] leading-5 text-amber-800">
                            Confirm only after the transfer has actually been sent. This will deduct {money(withdrawal.amount)} from the customer's available balance.
                          </p>
                          <button
                            type="button"
                            onClick={() => confirmPaid(withdrawal)}
                            disabled={busy || paymentReference.trim().length < 3}
                            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {busy ? "Saving…" : "Confirm paid"}
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(withdrawal.id, "Rejected", {
                            adminNote: "Withdrawal rejected by admin.",
                          })
                        }
                        disabled={busy}
                        className="mt-2 w-full rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-semibold text-rose-700 disabled:opacity-50"
                      >
                        Reject request
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
