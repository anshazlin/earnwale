"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const [latestWithdrawal, setLatestWithdrawal] = useState<{ status?: string; amount?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard", {
          credentials: "include",
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          window.location.href = "/login";
          return;
        }
        if (!res.ok) throw new Error("Dashboard request failed");

        const data = await res.json();
        if (!cancelled) {
          setUser(data?.user ?? null);
          setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
          setLatestWithdrawal(data?.latestWithdrawal ?? null);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const referralLink = useMemo(() => {
    if (typeof window === "undefined" || !user?.referralCode) return "";
    return `${window.location.origin}/signup?ref=${user.referralCode}`;
  }, [user?.referralCode]);

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

  const formatAmount = (value?: number) =>
    typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : "₹0";

  if (loading) return <DashboardSkeleton />;

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Dashboard unavailable</p>
        <p className="mt-1 text-xs text-slate-500">Please refresh the page and try again.</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">Partner dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, {user.name}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
              Your earnings, referrals and recent activity in one place.
            </p>
          </div>
          <Link href="/dashboard/withdraw" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
            Withdraw earnings
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Available" value={formatAmount(user.earnings)} emphasis />
        <Metric label="Referral earnings" value={formatAmount(user.totalEarned)} />
        <Metric label="Referrals" value={String(user.referralCount ?? 0)} />
        <Metric label="Withdrawal" value={latestWithdrawal?.status ? String(latestWithdrawal.status).replace(/^./, (s) => s.toUpperCase()) : "None"} />
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">Your referral link</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Share your unique link. Eligible referrals are tracked automatically.</p>
          </div>
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            {user.referralCode}
          </span>
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3 font-mono text-xs text-slate-600">
          <p className="truncate">{referralLink}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={handleCopyReferral} className="min-h-11 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50">
            {copied ? "Copied ✓" : "Copy link"}
          </button>
          <button onClick={handleShareReferral} className="min-h-11 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-300">
            Share
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">Recent activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">Your latest wallet transactions.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
          {transactions.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No transactions yet</p>
              <p className="mt-1 text-xs text-slate-500">Your wallet activity will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {transactions.map((tx, index) => {
                const credit = (tx.type ?? "").toUpperCase() === "CREDIT";
                return (
                  <li key={tx.id ?? index} className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{tx.description ?? tx.type ?? "Transaction"}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <p className={`shrink-0 text-sm font-semibold ${credit ? "text-emerald-700" : "text-slate-900"}`}>
                      {credit ? "+" : ""}{formatAmount(tx.amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-3.5 shadow-sm sm:p-4">
      <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 truncate text-lg font-semibold tracking-tight sm:text-xl ${emphasis ? "text-amber-700" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="flex min-h-16 items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center text-xs font-semibold text-slate-700 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 sm:text-sm">
      {label}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
      <div className="h-44 rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-20 rounded-2xl bg-slate-200" />)}
      </div>
      <div className="h-32 rounded-2xl bg-slate-200" />
      <div className="h-56 rounded-2xl bg-slate-200" />
    </div>
  );
}
