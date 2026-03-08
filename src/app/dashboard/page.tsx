"use client";

import { useState, useEffect, useCallback } from "react";

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
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });

      if (!res.ok) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      const u = data.user ?? data;
      setUser(u);
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;

    setWalletLoading(true);

    fetch("/api/wallet", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list =
          Array.isArray(data) ? data : data?.transactions ?? data?.data ?? [];
        setTransactions(Array.isArray(list) ? list : []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setWalletLoading(false));
  }, [user]);

  const referralLink =
    typeof window !== "undefined" && user?.referralCode
      ? `${window.location.origin}/signup?ref=${user.referralCode}`
      : "";

  const handleCopyReferral = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // no-op
    }
  };

  const handleShareReferral = async () => {
    if (!referralLink) return;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Join Earnwale",
          text: "Check out this premium learning platform.",
          url: referralLink,
        });
        return;
      }
    } catch {
      // ignore share cancellation or errors and fallback to copy
    }

    await handleCopyReferral();
  };

  const formatAmount = (n?: number) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Partner Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user.name}.</p>
      </div>

      {/* Cards stacked vertically */}
      <Card title="Name">{user.name}</Card>
      <Card title="Selected Plan">₹{user.plan}</Card>
      <Card title="Current Earnings">
        <span className="font-semibold text-amber-700">
          {formatAmount(user.earnings)}
        </span>
      </Card>
      <Card title="Total Earned">
        <span className="font-semibold text-amber-700">
          {formatAmount(user.totalEarned)}
        </span>
      </Card>
      <Card title="Referral Count">{user.referralCount ?? 0}</Card>

      {/* Referral section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">
            Your Referral Link
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Share this link to invite friends. Your referrals are tracked
            automatically.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="w-full max-w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-mono text-gray-900 sm:px-4 sm:text-sm">
              <div className="truncate">{referralLink}</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleCopyReferral}
                className="inline-flex w-full items-center justify-center rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-50 sm:w-auto"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={handleShareReferral}
                className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 sm:w-auto"
              >
                Share Link
              </button>
            </div>
          </div>
      </div>

      {/* Transactions */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your latest wallet activity.
          </p>
        </div>

        <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {walletLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y divide-amber-50">
              {transactions.map((tx, i) => (
                <li
                  key={tx.id ?? i}
                  className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
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
                    {formatAmount(tx.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-2 text-base font-semibold text-gray-900">
        {children}
      </div>
    </div>
  );
}