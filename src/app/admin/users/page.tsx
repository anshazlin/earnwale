"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminSidebar } from "../_components/sidebar";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: string;
  earnings: number;
  totalEarned: number;
  referralCount: number;
  createdAt: string;
};

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

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

  const fetchUsers = useCallback(
    async (opts?: { page?: number; search?: string }) => {
      const nextPage = opts?.page ?? page;
      const nextSearch = opts?.search ?? search;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        if (nextSearch.trim().length > 0) {
          params.set("search", nextSearch.trim());
        }

        const res = await fetch(`/api/admin/users?${params.toString()}`, {
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
          throw new Error("Failed to load users");
        }

        const data = await res.json();
        const list = data?.users ?? [];

        setUsers(Array.isArray(list) ? list : []);
        setTotal(typeof data?.total === "number" ? data.total : 0);
        setPage(typeof data?.page === "number" ? data.page : nextPage);
        setSearch(nextSearch);
      } catch (err) {
        console.error(err);
        setError("Unable to load users. Please try again.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers({ page: 1, search: searchInput });
  };

  const handlePageChange = (direction: "prev" | "next") => {
    setPage((current) => {
      const next =
        direction === "prev" ? Math.max(1, current - 1) : current + 1;
      if (next === current) return current;
      fetchUsers({ page: next });
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <AdminSidebar />

      <div className="flex-1 md:pl-64">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                Users
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                View all Earnwale users, plans, and earnings.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full max-w-md items-center gap-2"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Search
              </button>
            </form>
            {search && (
              <p className="text-xs text-slate-500">
                Showing results for{" "}
                <span className="font-medium text-slate-700">"{search}"</span>
              </p>
            )}
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
                    Loading users…
                  </p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 py-12 text-center sm:px-6">
                <p className="text-sm font-medium text-slate-700">
                  No users found
                </p>
                <p className="max-w-sm text-xs text-slate-500">
                  Try adjusting your search or check back later.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-4 py-3 sm:px-6">Name</th>
                      <th className="px-4 py-3 sm:px-6">Email</th>
                      <th className="px-4 py-3 sm:px-6">Selected Plan</th>
                      <th className="px-4 py-3 sm:px-6">Earnings</th>
                      <th className="px-4 py-3 sm:px-6">Total Earned</th>
                      <th className="px-4 py-3 sm:px-6">Referral Count</th>
                      <th className="px-4 py-3 sm:px-6">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 sm:px-6">
                          {user.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600 sm:px-6 sm:text-sm">
                          {user.email}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 sm:px-6">
                          {user.plan}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 sm:px-6">
                          {formatCurrency(user.earnings)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900 sm:px-6">
                          {formatCurrency(user.totalEarned)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 sm:px-6">
                          {user.referralCount}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 sm:px-6 sm:text-sm">
                          {formatDate(user.createdAt)}
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
      </div>
    </div>
  );
}

