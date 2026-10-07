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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
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
              Your learning account, referral earnings and payout status in one place.
            </p>
          </div>
          <Link href="/dashboard/wallet" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">
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

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard">
      <div className="h-44 rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-20 rounded-2xl bg-slate-200" />)}
      </div>
      <div className="h-32 rounded-2xl bg-slate-200" />
    </div>
  );
}
