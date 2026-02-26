"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type User = {
  id?: string;
  name: string;
  email?: string;
  plan: string;
  referralCode: string;
  earnings: number;
  totalEarned: number;
  referralCount?: number;
};

type Transaction = {
  id?: string;
  amount?: number;
  type?: string;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        window.location.href = "/login";
        return null;
      }
      const data = await res.json();
      const u = data.user ?? data;
      setUser(u);
      return u;
    } catch {
      window.location.href = "/login";
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setWalletLoading(true);
    fetch("/api/wallet", { credentials: "include" })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setTransactions([]);
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.transactions ?? data?.data ?? [];
        setTransactions(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setTransactions([]);
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.href = "/login";
    }
  };

  const copyReferralCode = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAmount = (n: number | undefined) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-amber-50/30">
      <header className="border-b border-amber-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            Earnwale
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-70"
          >
            {logoutLoading ? "Logging out…" : "Logout"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            Welcome back, {user.name}.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{user.name}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Selected plan</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">₹{user.plan}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Referral code</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 font-mono text-lg font-semibold text-gray-900">
                {user.referralCode || "—"}
              </code>
              {user.referralCode && (
                <button
                  type="button"
                  onClick={copyReferralCode}
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            {user.earnings >= 500 && (
                <button
                  onClick={async () => {
                    const res = await fetch("/api/withdraw/request", {
                      method: "POST",
                      credentials: "include",
                    });

                    const data = await res.json();
                    alert(data.success ? "Withdrawal requested!" : data.error);
                  }}
                  className="mt-6 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600"
                >
                  Request Withdrawal
                </button>
              )}
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Current earnings</p>
            <p className="mt-2 text-lg font-semibold text-amber-700">
              {formatAmount(user.earnings)}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total earned</p>
            <p className="mt-2 text-lg font-semibold text-amber-700">
              {formatAmount(user.totalEarned)}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Referral count</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {typeof user.referralCount === "number" ? user.referralCount : 0}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Recent transactions</h2>
          <p className="mt-1 text-sm text-gray-500">Your latest wallet activity.</p>
          <div className="mt-4 rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
            {walletLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No transactions yet.
              </div>
            ) : (
              <ul className="divide-y divide-amber-50">
                {transactions.map((tx, i) => (
                  <li
                    key={tx.id ?? i}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {tx.description ?? tx.type ?? "Transaction"}
                      </p>
                      {tx.createdAt && (
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-amber-700">
                      {typeof tx.amount === "number" ? formatAmount(tx.amount) : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
