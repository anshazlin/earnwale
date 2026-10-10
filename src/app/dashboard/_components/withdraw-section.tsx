"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id?: string;
  name: string;
  email?: string;
  earnings: number;
};

type WithdrawStatus = "pending" | "paid" | "rejected" | "approved" | string;

type Withdraw = {
  id?: string;
  amount?: number;
  status?: WithdrawStatus;
  createdAt?: string;
  paymentReference?: string;
  paidAt?: string;
  [key: string]: unknown;
};

export function WithdrawSection({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [history, setHistory] = useState<Withdraw[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (targetPage: number) => {
    setLoadingHistory(true);
    setError(null);
    try {
      const res = await fetch(`/api/withdraw?page=${targetPage}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load withdrawals");
      const json = await res.json();
      setBalance(Number(json?.balance ?? 0));
      setHistory(Array.isArray(json?.withdrawals) ? json.withdrawals : []);
      setHasMore(Boolean(json?.hasMore));
    } catch (err) {
      console.error(err);
      setError("Unable to load withdrawal details. Please try again.");
    } finally {
      setLoadingHistory(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const hasOpenWithdrawal = useMemo(
    () =>
      history.some((w) => {
        const s = (w.status ?? "").toString().toLowerCase();
        return s === "pending" || s === "approved";
      }),
    [history],
  );

  const canWithdraw = useMemo(
    () =>
      balance >= 250 &&
      !hasOpenWithdrawal,
    [balance, hasOpenWithdrawal],
  );

  const formatAmount = (n: number | undefined) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  const formatStatus = (value: WithdrawStatus | undefined) => {
    const v = (value ?? "").toString().toLowerCase();

    if (v === "paid") return "Paid";
    if (v === "rejected") return "Rejected";
    return "Pending";
  };

  const statusStyles = (value: WithdrawStatus | undefined) => {
    const v = (value ?? "").toString().toLowerCase();

    if (v === "paid") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";
    }

    if (v === "rejected") {
      return "bg-rose-50 text-rose-700 ring-rose-100";
    }

    return "bg-amber-50 text-amber-700 ring-amber-100";
  };

  const handleWithdraw = async () => {
    if (!canWithdraw || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/withdraw/request", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        const message =
          data?.error ||
          data?.message ||
          "Unable to submit withdrawal request. Please try again.";
        setError(message);
        return;
      }

      if (page === 1) {
        await fetchData(1);
      } else {
        setPage(1);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="space-y-6 sm:space-y-8">
      {!embedded && (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
            Withdraw
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Request payouts from your available balance.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
        <section className="w-full rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available balance
              </p>
              <p className="mt-2 text-xl font-semibold text-amber-700 sm:text-2xl">
                {formatAmount(balance)}
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Minimum withdrawal amount is{" "}
            <span className="font-semibold">250</span>. Requests are reviewed and processed within 24 hours. Bank/UPI settlement times may vary.
          </p>

          {error && (
            <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!canWithdraw || submitting}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
          >
            {submitting ? "Submitting request…" : "Request Withdraw"}
          </button>

          {!canWithdraw && (
            <p className="mt-2 text-xs text-gray-500">
              {hasOpenWithdrawal
                ? "You already have a withdrawal in progress. Wait until it is paid or rejected before requesting again."
                : "You need at least ₹250 in available balance to request a withdrawal."}
            </p>
          )}
        </section>

        <section className="w-full rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Withdraw history
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Track the status of your recent withdrawal requests.
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-amber-50">
            {loadingHistory ? (
              <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <span className="text-xs">Loading history…</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-500">
                No withdrawals yet.
              </div>
            ) : (
              <>
                {/* Mobile: stacked cards */}
                <div className="space-y-3 md:hidden">
                  {history.map((w, index) => (
                    <div
                      key={w.id ?? index}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatAmount(
                            typeof w.amount === "number"
                              ? w.amount
                              : Number(w.amount),
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {w.createdAt
                            ? new Date(w.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                        {w.paymentReference && (
                          <p className="mt-1 text-[11px] font-medium text-emerald-700">Ref: {w.paymentReference}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${statusStyles(
                          w.status,
                        )}`}
                      >
                        {formatStatus(w.status)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Desktop: table */}
                <div className="max-h-[420px] overflow-x-auto overflow-y-auto bg-amber-50/20 hidden md:block">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-50/60 text-[11px] uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50 bg-white">
                      {history.map((w, index) => (
                        <tr key={w.id ?? index} className="align-middle">
                          <td className="px-4 py-3 text-gray-900">
                            {formatAmount(
                              typeof w.amount === "number"
                                ? w.amount
                                : Number(w.amount),
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${statusStyles(
                                w.status,
                              )}`}
                            >
                              {formatStatus(w.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {w.createdAt
                              ? new Date(w.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{w.paymentReference ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button type="button" disabled={page === 1 || loadingHistory} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40">Previous</button>
            <span className="text-xs text-slate-500">Page {page}</span>
            <button type="button" disabled={!hasMore || loadingHistory} onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40">Next</button>
          </div>
        </section>
      </div>
    </div>
  );
}

