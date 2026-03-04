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

 const shareReferral = () => {
  if (!user?.referralCode) return;

    const message =
      `Join Earnwale and earn money by referring friends!\n\n` +
      `Signup using my referral code: ${user.referralCode}\n\n` +
      `https://earnwale.vercel.app/signup?ref=${user.referralCode}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
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
    <>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-gray-500">
          Welcome back, {user.name}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Name">{user.name}</Card>

        <Card title="Selected Plan">₹{user.plan}</Card>

        <Card title="Referral Code">
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-lg font-semibold">
              {user.referralCode}
            </code>
           <button
              onClick={shareReferral}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Share on WhatsApp
            </button>
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
              className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
            >
              Request Withdrawal
            </button>
          )}
        </Card>

        <Card title="Current Earnings">
          <span className="text-amber-700 font-semibold">
            {formatAmount(user.earnings)}
          </span>
        </Card>

        <Card title="Total Earned">
          <span className="text-amber-700 font-semibold">
            {formatAmount(user.totalEarned)}
          </span>
        </Card>

        <Card title="Referral Count">
          {user.referralCount ?? 0}
        </Card>
      </div>

      {/* Transactions */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">
          Recent Transactions
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your latest wallet activity.
        </p>

        <div className="mt-4 rounded-2xl border border-amber-100 bg-white shadow-sm overflow-hidden">
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
                  className="flex items-center justify-between px-6 py-4"
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
    </>
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
    <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="mt-2 text-lg font-semibold text-gray-900">
        {children}
      </div>
    </div>
  );
}