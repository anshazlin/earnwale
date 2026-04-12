"use client";

import { useCallback, useEffect, useState } from "react";

type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected" | string;

type Withdrawal = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  user: {
    name: string;
    email: string;
    upiId?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    ifscCode?: string | null;
  };
};

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const s = (status ?? "").toString().toLowerCase();
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  const label =
    s === "approved"
      ? "Approved"
      : s === "rejected"
        ? "Rejected"
        : s === "paid"
          ? "Paid"
          : "Pending";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[s] ?? styles.pending}`}
    >
      {label}
    </span>
  );
}

export default function AdminWithdrawPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/withdraw/list", {
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (res.status === 403) {
        window.location.href = "/dashboard";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load withdrawals");
      }

      const data = await res.json();
      const list = data?.withdrawals ?? [];
      setWithdrawals(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load withdrawals. Please try again.");
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const updateStatus = async (id: string, status: "Paid" | "Rejected") => {
    setUpdatingId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/withdrawal/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id, status }),
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

      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatAmount = (n: number) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Withdrawal Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and process user withdrawal requests.
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </a>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                <p className="text-sm text-gray-600">Loading withdrawals…</p>
              </div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 12H4m0 0 6-6m-6 6 6 6"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">
                No withdrawal requests
              </p>
              <p className="max-w-sm text-xs text-gray-500">
                When users request withdrawals, they will appear here for
                review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[600px] w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      UPI ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Bank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      IFSC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {withdrawals.map((w) => {
                    const status = (w.status ?? "").toString().toLowerCase();
                    const isPending = status === "pending";
                    const busy = updatingId === w.id;

                    return (
                      <tr
                        key={w.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {w.user?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {w.user?.email ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatAmount(w.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {w.user?.upiId ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                          {w.user?.bankName ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-600">
                          {w.user?.accountNumber ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-600">
                          {w.user?.ifscCode ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={w.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {formatDate(w.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateStatus(w.id, "Paid")}
                                  disabled={busy}
                                  className="rounded-lg bg-green-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                                >
                                  {busy ? "…" : "Approve"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(w.id, "Rejected")
                                  }
                                  disabled={busy}
                                  className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                                >
                                  {busy ? "…" : "Reject"}
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No actions
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}
