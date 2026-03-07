"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

type ActionState = {
  id: string;
  action: "approve" | "reject" | "paid";
};

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const s = (status ?? "").toString().toLowerCase();
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    approved: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    rejected: "bg-red-50 text-red-700 ring-1 ring-red-100",
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
  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "paid" | "rejected"
  >("all");
  const [emailFilter, setEmailFilter] = useState("");

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

  const handleAction = async (
    withdrawalId: string,
    action: "approve" | "reject" | "paid",
  ) => {
    setActionState({ id: withdrawalId, action });
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/withdraw/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ withdrawalId, action }),
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

      const labels: Record<string, string> = {
        approve: "Withdrawal approved",
        reject: "Withdrawal rejected",
        paid: "Marked as paid",
      };
      setSuccessMessage(labels[action] ?? "Done");
      await fetchList();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setActionState(null);
    }
  };

  const formatAmount = (n: number) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const isActionLoading = (id: string) =>
    actionState?.id === id && !!actionState?.action;

  const pendingCount = useMemo(
    () =>
      withdrawals.filter(
        (w) => (w.status ?? "").toString().toLowerCase() === "pending",
      ).length,
    [withdrawals],
  );

  const pendingAmount = useMemo(
    () =>
      withdrawals
        .filter(
          (w) => (w.status ?? "").toString().toLowerCase() === "pending",
        )
        .reduce((sum, w) => sum + (w.amount ?? 0), 0),
    [withdrawals],
  );

  const paidAmount = useMemo(
    () =>
      withdrawals
        .filter((w) => (w.status ?? "").toString().toLowerCase() === "paid")
        .reduce((sum, w) => sum + (w.amount ?? 0), 0),
    [withdrawals],
  );

  const rejectedAmount = useMemo(
    () =>
      withdrawals
        .filter(
          (w) => (w.status ?? "").toString().toLowerCase() === "rejected",
        )
        .reduce((sum, w) => sum + (w.amount ?? 0), 0),
    [withdrawals],
  );

  const filteredWithdrawals = useMemo(() => {
    const status = statusFilter.toLowerCase();
    const email = emailFilter.trim().toLowerCase();

    return withdrawals.filter((w) => {
      const wStatus = (w.status ?? "").toString().toLowerCase();
      const matchesStatus = status === "all" || wStatus === status;
      const matchesEmail =
        email.length === 0 ||
        (w.user?.email ?? "").toLowerCase().includes(email);
      return matchesStatus && matchesEmail;
    });
  }, [withdrawals, statusFilter, emailFilter]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setEmailFilter("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
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

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Pending Requests
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {pendingCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Pending Amount
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatAmount(pendingAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Paid Amount
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatAmount(paidAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Rejected Amount
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {formatAmount(rejectedAmount)}
            </p>
          </div>
        </section>

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        <section className="mb-4 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="status"
                  className="text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "all"
                        | "pending"
                        | "approved"
                        | "paid"
                        | "rejected",
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex flex-1 items-center gap-2">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="text"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  placeholder="Filter by email"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
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
          ) : filteredWithdrawals.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <p className="text-sm font-medium text-gray-700">
                No withdrawals match your filters
              </p>
              <p className="max-w-sm text-xs text-gray-500">
                Try changing the status or email filter, or clear all filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      User Name
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
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Requested Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredWithdrawals.map((w) => {
                    const status = (w.status ?? "").toString().toLowerCase();
                    const isPending = status === "pending";
                    const isApproved = status === "approved";
                    const showActions = isPending || isApproved;
                    const loadingThis = isActionLoading(w.id);

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
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={w.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {formatDate(w.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {showActions ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAction(w.id, "approve")
                                    }
                                    disabled={loadingThis}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
                                  >
                                    {loadingThis &&
                                    actionState?.action === "approve"
                                      ? "…"
                                      : "Approve"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAction(w.id, "reject")
                                    }
                                    disabled={loadingThis}
                                    className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
                                  >
                                    {loadingThis &&
                                    actionState?.action === "reject"
                                      ? "…"
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
                                  disabled={loadingThis}
                                  className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  {loadingThis && actionState?.action === "paid"
                                    ? "…"
                                    : "Mark as Paid"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
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
        </div>
      </div>
    </div>
  );
}

