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
    } catch {}
  };

  const handleShareReferral = async () => {
    if (!referralLink) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Earnwale",
          text: "Check out this premium learning platform.",
          url: referralLink,
        });
        return;
      }
    } catch {}

    await handleCopyReferral();
  };

  const formatAmount = (n?: number) =>
    typeof n === "number" ? `₹${n.toLocaleString()}` : "₹0";

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-md px-3 sm:px-4">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <p className="text-xs text-gray-500 sm:text-sm">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-screen-md px-3 sm:px-4">
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-sm font-semibold text-gray-900 sm:text-xl">
            Partner Dashboard
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Welcome back, {user.name}.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <Card title="Name">{user.name}</Card>
          <Card title="Selected Plan">₹{user.plan}</Card>
          <Card title="Current Earnings">
            <span className="text-base font-semibold text-amber-700 sm:text-lg">
              {formatAmount(user.earnings)}
            </span>
          </Card>
          <Card title="Total Earned">
            <span className="text-base font-semibold text-amber-700 sm:text-lg">
              {formatAmount(user.totalEarned)}
            </span>
          </Card>
          <Card title="Referral Count">{user.referralCount ?? 0}</Card>
        </div>

        {/* Referral */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-900 sm:text-base">
            Your Referral Link
          </h2>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Share this link to invite friends. Your referrals are tracked automatically.
          </p>

          <div className="mt-3 flex flex-col gap-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-mono text-gray-900 sm:text-sm">
              <div className="truncate">{referralLink}</div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleCopyReferral}
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 sm:w-auto sm:text-sm"
              >
                {copied ? "Copied" : "Copy link"}
              </button>

              <button
                onClick={handleShareReferral}
                className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-600 sm:w-auto sm:text-sm"
              >
                Share Link
              </button>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <section className="space-y-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-lg">
              Recent Transactions
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Your latest wallet activity.
            </p>
          </div>

          <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {walletLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <span className="text-xs sm:text-sm">Loading…</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 sm:text-sm">
                No transactions yet.
              </div>
            ) : (
              <ul className="divide-y divide-amber-50">
                {transactions.map((tx, i) => (
                  <li
                    key={tx.id ?? i}
                    className="flex items-center justify-between px-3 py-3"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-xs font-medium text-gray-900 sm:text-sm">
                        {tx.description ?? tx.type ?? "Transaction"}
                      </p>
                      {tx.createdAt && (
                        <p className="text-[10px] text-gray-500 sm:text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-xs font-semibold text-amber-700 sm:text-sm">
                      {formatAmount(tx.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
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
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500 sm:text-sm">{title}</p>
      <div className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
        {children}
      </div>
    </div>
  );
}