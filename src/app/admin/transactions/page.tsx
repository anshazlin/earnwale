"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
type AdminTransaction = {
  id: string;
  type: string;
  amount: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
};

const PAGE_SIZE = 10;

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">(
    "all",
  );

  const totalPages = useMemo(
    () => (total > 0 ? Math.ceil(total / PAGE_SIZE) : 1),
    [total],
  );

  const formatCurrency = (value: number | null | undefined) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "₹0";
    return `₹${value.toLocaleString()}`;
  };

  const formatDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatTypeLabel = (value: string) => {
    const v = (value ?? "").toString().toUpperCase();
    if (v === "CREDIT") return "Credit";
    if (v === "DEBIT") return "Debit";
    return value;
  };

  const fetchTransactions = useCallback(
    async (opts?: { page?: number; typeFilter?: "all" | "credit" | "debit" }) => {
      const nextPage = opts?.page ?? page;
      const nextFilter = opts?.typeFilter ?? typeFilter;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        if (nextFilter !== "all") {
          params.set("type", nextFilter);
        }

        const res = await fetch(
          `/api/admin/transactions?${params.toString()}`,
          {
            credentials: "include",
          },
        );

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (res.status === 403) {
          window.location.href = "/dashboard";
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load transactions");
        }

        const data = await res.json();
        const list = data?.transactions ?? [];

        setTransactions(Array.isArray(list) ? list : []);
        setTotal(typeof data?.total === "number" ? data.total : 0);
        setPage(typeof data?.page === "number" ? data.page : nextPage);
        setTypeFilter(nextFilter);
      } catch (err) {
        console.error(err);
        setError("Unable to load transactions. Please try again.");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [page, typeFilter],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value as "all" | "credit" | "debit";
    setPage(1);
    fetchTransactions({ page: 1, typeFilter: value });
  };

  const handlePageChange = (direction: "prev" | "next") => {
    setPage((current) => {
      const next =
        direction === "prev" ? Math.max(1, current - 1) : current + 1;
      if (next === current) return current;
      fetchTransactions({ page: next });
      return next;
    });
  };

  return (
    <>
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4 sm:h-16">
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Transactions
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                View all credit and debit activity across users.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-screen-md px-4 py-6">
          <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Filter
              </span>
              <select
                value={typeFilter}
                onChange={handleFilterChange}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {TYPE_FILTERS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {error && (
              <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 sm:px-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center px-4 py-10 sm:px-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  <p className="text-sm text-slate-600">
                    Loading transactions…
                  </p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 py-12 text-center sm:px-6">
                <p className="text-sm font-medium text-slate-700">
                  No transactions found
                </p>
                <p className="max-w-sm text-xs text-slate-500">
                  Try changing the filter or check back later.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3 sm:px-6">User Name</th>
                      <th className="px-4 py-3 sm:px-6">Email</th>
                      <th className="px-4 py-3 sm:px-6">Type</th>
                      <th className="px-4 py-3 sm:px-6">Amount</th>
                      <th className="px-4 py-3 sm:px-6">Description</th>
                      <th className="px-4 py-3 sm:px-6">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 sm:px-6">
                          {tx.user?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 sm:px-6 sm:text-sm">
                          {tx.user?.email ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold sm:px-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              (tx.type ?? "").toString().toUpperCase() ===
                              "CREDIT"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                : "bg-red-50 text-red-700 ring-1 ring-red-100"
                            }`}
                          >
                            {formatTypeLabel(tx.type)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 sm:px-6">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 sm:px-6">
                          {/* Description not stored in schema; keep placeholder for future use */}
                          —
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 sm:px-6 sm:text-sm">
                          {formatDate(tx.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600 sm:px-6">
              <div>
                Page <span className="font-semibold">{page}</span> of{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange("prev")}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange("next")}
                  disabled={page >= totalPages || loading}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
    </>
  );
}

