"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type User = {
  id?: string;
  name: string;
  email?: string;
  earnings: number;
};

type WithdrawStatus = "pending" | "approved" | "rejected" | string;

type Withdraw = {
  id?: string;
  amount?: number;
  status?: WithdrawStatus;
  createdAt?: string;
  [key: string]: unknown;
};

export default function WithdrawPage() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Withdraw[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return null;
        }
        throw new Error("Failed to load user");
      }

      const data = await res.json();
      const u = data.user ?? data;
      setUser(u);
      return u as User;
    } catch (err) {
      console.error(err);
      setError("Unable to load your account. Please try again.");
      return null;
    } finally {
      setLoadingUser(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/withdraw", {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to load withdrawals");
      }

      const json = await res.json();
      const list = Array.isArray(json)
        ? json
        : json?.withdrawals ?? json?.data ?? [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchUser().then((u) => {
      if (!u || cancelled) return;
      fetchHistory();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchUser, fetchHistory]);

  const canWithdraw = useMemo(
    () => !!user && typeof user.earnings === "number" && user.earnings >= 500,
    [user],
  );

  const formatAmount = (n: number | undefined) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  const formatStatus = (value: WithdrawStatus | undefined) => {
    const v = (value ?? "").toString().toLowerCase();
    if (v === "approved") return "Approved";
    if (v === "rejected") return "Rejected";
    return "Pending";
  };

  const statusStyles = (value: WithdrawStatus | undefined) => {
    const v = (value ?? "").toString().toLowerCase();
    if (v === "approved") {
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

      await fetchUser();
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-600">
            Loading withdraw details…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Withdraw
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Request payouts from your available balance.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Available balance
              </p>
              <p className="mt-2 text-2xl font-semibold text-amber-700">
                {formatAmount(user.earnings)}
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Minimum withdraw amount is{" "}
            <span className="font-semibold">₹500</span>. Requests are reviewed
            by our team before being processed.
          </p>

          {error && (
            <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>
          )}

          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!canWithdraw || submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting request…" : "Request Withdraw"}
          </button>

          {!canWithdraw && (
            <p className="mt-2 text-xs text-gray-500">
              You need at least ₹500 in available balance to request a
              withdrawal.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Withdraw history
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Track the status of your recent withdrawal requests.
              </p>
            </div>
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
              <div className="max-h-[420px] overflow-y-auto bg-amber-50/20">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-amber-50/60 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

