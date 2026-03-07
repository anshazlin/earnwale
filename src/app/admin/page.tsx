"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "./_components/sidebar";

type WithdrawalStatus = "pending" | "approved" | "paid" | "rejected" | string;

type Withdrawal = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

type ActionKind = "approve" | "reject" | "paid";

type ActionState = {
  id: string;
  action: ActionKind;
} | null;

type StatCardProps = {
  label: string;
  value: string | number | null;
};

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return `₹${value.toLocaleString()}`;
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const normalized = (status ?? "").toString().toLowerCase();
  const label =
    normalized === "approved"
      ? "Approved"
      : normalized === "paid"
        ? "Paid"
        : normalized === "rejected"
          ? "Rejected"
          : "Pending";

  const color =
    normalized === "approved"
      ? "bg-blue-100 text-blue-800 ring-blue-100"
      : normalized === "paid"
        ? "bg-emerald-100 text-emerald-800 ring-emerald-100"
        : normalized === "rejected"
          ? "bg-red-100 text-red-800 ring-red-100"
          : "bg-amber-100 text-amber-800 ring-amber-100";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${color}`}
    >
      {label}
    </span>
  );
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
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
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const pendingCount = useMemo(
    () =>
      withdrawals.filter(
        (w) => (w.status ?? "").toString().toLowerCase() === "pending",
      ).length,
    [withdrawals],
  );

  const totalWithdrawn = useMemo(
    () =>
      withdrawals
        .filter(
          (w) => (w.status ?? "").toString().toLowerCase() === "paid",
        )
        .reduce((sum, w) => sum + (w.amount ?? 0), 0),
    [withdrawals],
  );

  const handleAction = async (id: string, action: ActionKind) => {
    setActionState({ id, action });
    setError(null);

    try {
      const res = await fetch("/api/admin/withdraw/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ withdrawalId: id, action }),
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

      if (!res.ok || !data?.success) {
        setError(data?.error ?? "Action failed. Please try again.");
        return;
      }

      const message =
        action === "approve"
          ? "Withdrawal approved"
          : action === "reject"
            ? "Withdrawal rejected"
            : "Marked as paid";

      setToast(message);
      await fetchWithdrawals();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setActionState(null);
    }
  };

  const isActionLoading = (id: string, action: ActionKind) =>
    actionState?.id === id && actionState.action === action;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <AdminSidebar />

      <div className="flex-1 md:pl-64">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Admin Dashboard
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Monitor Earnwale performance and manage withdrawals.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={null} />
            <StatCard label="Total Earnings" value={formatCurrency(null)} />
            <StatCard label="Pending Withdrawals" value={pendingCount} />
            <StatCard
              label="Total Withdrawn"
              value={formatCurrency(totalWithdrawn)}
            />
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent withdrawal requests
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Approve, reject, or mark payouts as paid.
                </p>
              </div>
            </div>

            {error && (
              <div className="mx-4 mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 sm:mx-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center px-4 py-10 sm:px-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <p className="text-sm text-slate-600">
                    Loading withdrawal data…
                  </p>
                </div>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 px-4 py-12 text-center sm:px-6">
                <p className="text-sm font-medium text-slate-700">
                  No withdrawal requests
                </p>
                <p className="max-w-sm text-xs text-slate-500">
                  When users request withdrawals, they will show up here for
                  review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3 sm:px-6">User</th>
                      <th className="px-4 py-3 sm:px-6">Email</th>
                      <th className="px-4 py-3 sm:px-6">Amount</th>
                      <th className="px-4 py-3 sm:px-6">Status</th>
                      <th className="px-4 py-3 sm:px-6">Date</th>
                      <th className="px-4 py-3 text-right sm:px-6">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {withdrawals.map((w) => {
                      const status = (w.status ?? "")
                        .toString()
                        .toLowerCase();
                      const isPending = status === "pending";
                      const isApproved = status === "approved";

                      return (
                        <tr
                          key={w.id}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 sm:px-6">
                            {w.user?.name ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 sm:px-6 sm:text-sm">
                            {w.user?.email ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 sm:px-6">
                            {formatCurrency(w.amount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                            <StatusBadge status={w.status} />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 sm:px-6 sm:text-sm">
                            {w.createdAt
                              ? new Date(w.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right sm:px-6">
                            {isPending || isApproved ? (
                              <div className="flex flex-wrap justify-end gap-2">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAction(w.id, "approve")
                                      }
                                      disabled={isActionLoading(
                                        w.id,
                                        "approve",
                                      )}
                                      className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                                    >
                                      {isActionLoading(w.id, "approve")
                                        ? "Approving…"
                                        : "Approve"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAction(w.id, "reject")
                                      }
                                      disabled={isActionLoading(
                                        w.id,
                                        "reject",
                                      )}
                                      className="inline-flex items-center rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
                                    >
                                      {isActionLoading(w.id, "reject")
                                        ? "Rejecting…"
                                        : "Reject"}
                                    </button>
                                  </>
                                )}
                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAction(w.id, "paid")
                                    }
                                    disabled={isActionLoading(w.id, "paid")}
                                    className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
                                  >
                                    {isActionLoading(w.id, "paid")
                                      ? "Marking…"
                                      : "Mark as Paid"}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No actions
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-40 max-w-xs rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
