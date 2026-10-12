"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type User = {
  id?: string;
  name: string;
  email?: string;
  plan?: string | number | null;
  affiliateStatus?: string;
  affiliateCode?: string | null;
  earnings: number;
  totalEarned: number;
  referralCount?: number;
};

export default function PersonalDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [latestWithdrawal, setLatestWithdrawal] = useState<{
    status?: string;
    amount?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [affiliateTermsAccepted, setAffiliateTermsAccepted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDashboard = async () => {
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
      setUser(data?.user ?? null);
      setLatestWithdrawal(data?.latestWithdrawal ?? null);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const affiliateActive =
    String(user?.affiliateStatus ?? "").toLowerCase() === "active" &&
    Boolean(user?.affiliateCode);

  const affiliateLink = useMemo(() => {
    if (
      typeof window === "undefined" ||
      !affiliateActive ||
      !user?.affiliateCode
    ) {
      return "";
    }
    return `${window.location.origin}/signup?aff=${user.affiliateCode}`;
  }, [affiliateActive, user?.affiliateCode]);

  const joinAffiliate = async () => {
    if (!affiliateTermsAccepted || joining) return;
    setJoining(true);
    setMessage(null);

    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ acceptTerms: true }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.error || "Unable to join the Affiliate Program.");
        return;
      }

      setMessage(
        "Affiliate Program activated. Your unique link is ready to share.",
      );
      await loadDashboard();
    } catch {
      setMessage("Unable to join the Affiliate Program. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleCopyAffiliate = async () => {
    if (!affiliateLink) return;
    try {
      await navigator.clipboard.writeText(affiliateLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("Unable to copy the affiliate link on this device.");
    }
  };

  const handleShareAffiliate = async () => {
    if (!affiliateLink) return;

    const shareText =
      "Explore Earnwale Trading Academy courses. Affiliate earnings are not guaranteed.";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Earnwale Trading Academy",
          text: shareText,
          url: affiliateLink,
        });
        return;
      }
    } catch (shareError: unknown) {
      if (shareError instanceof Error && shareError.name === "AbortError") return;
    }

    window.open(
      "https://wa.me/?text=" +
        encodeURIComponent(`${shareText} ${affiliateLink}`),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const formatAmount = (value?: number) =>
    typeof value === "number"
      ? `₹${value.toLocaleString("en-IN")}`
      : "₹0";

  const displayName = user?.name?.trim() || "Member";
  const hasCourse = Boolean(String(user?.plan ?? "").trim());
  const canWithdraw = Number(user?.earnings ?? 0) >= 250;

  if (loading) return <DashboardSkeleton />;

  if (error || !user) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-900">
          Dashboard unavailable
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Please refresh the page and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-screen-md space-y-5 overflow-x-hidden">
      <section className="w-full min-w-0 rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
          Personal dashboard
        </span>
        <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Manage your learning access, optional Affiliate Program and payout
          details separately.
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {hasCourse ? (
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Continue learning
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Explore courses
            </Link>
          )}
          <Link
            href="/dashboard/wallet"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
          >
            {canWithdraw ? "Withdraw commission" : "View wallet"}
          </Link>
        </div>
      </section>

      <section className="grid w-full min-w-0 grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Available commission"
          value={formatAmount(user.earnings)}
          emphasis
        />
        <Metric
          label="Lifetime commission"
          value={formatAmount(user.totalEarned)}
        />
        <Metric
          label="Qualifying sales"
          value={String(user.referralCount ?? 0)}
        />
        <Metric
          label="Withdrawal"
          value={
            latestWithdrawal?.status
              ? String(latestWithdrawal.status).replace(/^./, (letter) =>
                  letter.toUpperCase(),
                )
              : "None"
          }
        />
      </section>

      {affiliateActive ? (
        <section className="w-full min-w-0 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Your affiliate link
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Commission is credited only for qualifying verified course
                sales. Joining or recruiting another affiliate pays nothing.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              {user.affiliateCode}
            </span>
          </div>

          <div className="mt-4 w-full min-w-0 rounded-xl bg-slate-50 px-3 py-3 font-mono text-xs text-slate-600">
            <p className="break-all">{affiliateLink}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyAffiliate}
              disabled={!affiliateLink}
              className="min-h-11 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 disabled:opacity-50"
            >
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <button
              onClick={handleShareAffiliate}
              disabled={!affiliateLink}
              className="min-h-11 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-300 disabled:opacity-50"
            >
              Share
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-slate-500">
            Current schedule: ₹220 for a qualifying ₹300 Starter sale and ₹400
            for a qualifying ₹500 Pro sale. Earnings are not guaranteed.
          </p>
        </section>
      ) : (
        <section className="w-full min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
            Optional Affiliate Program
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Join for free — no course purchase required
          </h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Buying a course does not automatically make you an affiliate. Join
            separately only if you want to recommend Earnwale courses and earn
            commissions from genuine qualifying sales.
          </p>

          <label className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3">
            <input
              type="checkbox"
              checked={affiliateTermsAccepted}
              onChange={(event) =>
                setAffiliateTermsAccepted(event.target.checked)
              }
              className="mt-1"
            />
            <span className="text-xs leading-5 text-slate-600">
              I agree to the{" "}
              <Link
                href="/affiliate-terms"
                className="font-semibold text-amber-700 underline"
              >
                Affiliate Program Terms
              </Link>
              . I understand that earnings are not guaranteed.
            </span>
          </label>

          <button
            type="button"
            disabled={!affiliateTermsAccepted || joining}
            onClick={joinAffiliate}
            className="mt-3 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
          >
            {joining ? "Activating…" : "Join Affiliate Program — Free"}
          </button>
        </section>
      )}

      {message && (
        <p className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-xs font-medium text-slate-700">
          {message}
        </p>
      )}

      <section className="grid w-full min-w-0 gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/profile"
          className="w-full min-w-0 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:bg-amber-50"
        >
          <p className="text-sm font-semibold text-slate-900">
            Profile & security
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            View your account details and change your password.
          </p>
        </Link>
        <Link
          href="/dashboard/support"
          className="w-full min-w-0 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:bg-amber-50"
        >
          <p className="text-sm font-semibold text-slate-900">Support</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Get help with courses, affiliate commissions or withdrawals.
          </p>
        </Link>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-amber-200 bg-white p-3.5 shadow-sm sm:p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 truncate text-lg font-semibold tracking-tight sm:text-xl ${
          emphasis ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading dashboard">
      <div className="h-44 rounded-3xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-20 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="h-32 rounded-2xl bg-slate-200" />
    </div>
  );
}
