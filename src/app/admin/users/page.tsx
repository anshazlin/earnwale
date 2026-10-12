"use client";

import { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan?: string | number | null;
  affiliateStatus?: string | null;
  earnings?: number;
  totalEarned?: number;
  referralCount?: number;
  referralCode?: string | null;
  createdAt?: string;
};

const PAGE_SIZE = 10;

function accountType(user: AdminUser) {
  const customer = Boolean(String(user.plan ?? "").trim());
  const status = String(user.affiliateStatus ?? "").toLowerCase();
  const affiliate = status === "active";
  const pending = status === "pending_verification";
  if (customer && affiliate) return "Customer + Affiliate";
  if (customer && pending) return "Customer + Pending Affiliate";
  if (customer) return "Customer";
  if (affiliate) return "Affiliate";
  if (pending) return "Affiliate pending verification";
  return "Member";
}

const money = (value?: number) =>
  `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => (total > 0 ? Math.ceil(total / PAGE_SIZE) : 1),
    [total],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ page: String(page) });
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(
          `/api/admin/users?${params.toString()}`,
          { credentials: "include", cache: "no-store" },
        );

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (res.status === 403) {
          window.location.href = "/dashboard";
          return;
        }
        if (!res.ok) throw new Error("Failed to load users");

        const data = await res.json();
        if (!cancelled) {
          setUsers(Array.isArray(data?.users) ? data.users : []);
          setTotal(Number(data?.total ?? 0));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load users. Please try again.");
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const copyAffiliateLink = async (user: AdminUser) => {
    const active =
      String(user.affiliateStatus ?? "").toLowerCase() === "active";
    if (!active || !user.referralCode) return;

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/signup?aff=${user.referralCode}`,
      );
      setCopiedUserId(user.id);
      window.setTimeout(() => setCopiedUserId(null), 1600);
    } catch {
      setError("Unable to copy affiliate link.");
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Users
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Distinguish customers, affiliates and accounts that are both.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
            className="flex w-full max-w-md items-center gap-2"
          >
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
          </form>
          <p className="text-xs text-slate-500">
            {total.toLocaleString("en-IN")} account{total === 1 ? "" : "s"}
          </p>
        </section>

        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-56 items-center justify-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3">Lifetime</th>
                    <th className="px-4 py-3">Sales</th>
                    <th className="px-4 py-3">Affiliate code</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const active =
                      String(user.affiliateStatus ?? "").toLowerCase() ===
                      "active";
                    return (
                      <tr key={user.id} className="align-top">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {user.name || "Member"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {user.email}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                            {accountType(user)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {user.plan ? `₹${user.plan}` : "None"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                          {money(user.earnings)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {money(user.totalEarned)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                          {Number(user.referralCount ?? 0)}
                        </td>
                        <td className="px-4 py-3">
                          {active && user.referralCode ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-slate-700">
                                {user.referralCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyAffiliateLink(user)}
                                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600"
                              >
                                {copiedUserId === user.id
                                  ? "Copied ✓"
                                  : "Copy link"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Test-credit controls are intentionally not available in production
          admin. Commission records should originate from verified qualifying
          course payments.
        </p>
      </main>
    </>
  );
}
