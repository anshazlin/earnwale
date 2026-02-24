"use client";

import { useState } from "react";
import Link from "next/link";

type PageKey = "dashboard" | "wallet" | "affiliate" | "leaderboard" | "profile";

const mockUser = {
  name: "Rahul Sharma",
  email: "rahul@example.com",
  plan: "Pro Plan (₹500)",
  planAmount: 500,
  referralCode: "EARN1234",
  referralLink: "https://earnwale.com/signup?ref=EARN1234",
  currentEarnings: 2750,
  totalEarned: 12500,
  referralCount: 34,
  walletBalance: 5200,
};

const mockTransactions = [
  { id: 1, date: "2026-02-01", description: "Referral reward", amount: 450, type: "Credit" },
  { id: 2, date: "2026-01-25", description: "Referral reward", amount: 250, type: "Credit" },
  { id: 3, date: "2026-01-10", description: "Withdrawal", amount: -1500, type: "Debit" },
];

const mockLeaderboard = Array.from({ length: 10 }).map((_, i) => ({
  rank: i + 1,
  name: i === 0 ? "You" : `Affiliate ${i}`,
  totalEarned: 10000 - i * 650,
}));

const mockCommission = [
  { plan: "Starter (₹300)", reward: "₹250 per referral" },
  { plan: "Pro (₹500)", reward: "₹450 per referral" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = (value: string, type: "code" | "link") => {
    navigator.clipboard.writeText(value);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatAmount = (amount: number) =>
    `₹${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const navItems: { key: PageKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "wallet", label: "Wallet" },
    { key: "affiliate", label: "Affiliate Panel" },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-amber-100 bg-white shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-amber-100 px-4">
          <Link href="/" className="text-lg font-semibold">
            Earnwale
          </Link>
          <button
            className="rounded-lg p-1 text-gray-500 hover:bg-amber-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActivePage(item.key);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                activePage === item.key
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-gray-700 hover:bg-amber-50"
              }`}
            >
              <span>{item.label}</span>
              {activePage === item.key && <span className="text-xs">●</span>}
            </button>
          ))}
        </nav>
        <div className="mt-6 border-t border-amber-100 px-3 pt-4">
          <button className="flex w-full items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
        {/* Top nav */}
        <header className="flex h-16 items-center justify-between border-b border-amber-100 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-1 text-gray-600 hover:bg-amber-50 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <p className="text-sm text-gray-500">Welcome back</p>
              <p className="text-base font-semibold text-gray-900">{mockUser.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-gray-500 sm:block">
              <span className="font-medium text-gray-900">Plan:</span> {mockUser.plan}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white">
              {mockUser.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {activePage === "dashboard" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Overview of your affiliate earnings and activity.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Current Earnings
                  </p>
                  <p className="mt-2 text-xl font-semibold text-amber-700">
                    {formatAmount(mockUser.currentEarnings)}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total Earned
                  </p>
                  <p className="mt-2 text-xl font-semibold text-amber-700">
                    {formatAmount(mockUser.totalEarned)}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Referrals
                  </p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">
                    {mockUser.referralCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Selected Plan
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-900">{mockUser.plan}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[2fr,1.2fr]">
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">Referral Code</h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Share this code to start earning.
                      </p>
                    </div>
                    <button
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
                      onClick={() => handleCopy(mockUser.referralCode, "code")}
                    >
                      {copiedCode ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 font-mono text-base font-semibold text-gray-900">
                    {mockUser.referralCode}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-sm font-semibold text-gray-900">Wallet Snapshot</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Available balance for withdrawal.
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-amber-700">
                    {formatAmount(mockUser.walletBalance)}
                  </p>
                  <button className="mt-4 w-full rounded-xl border border-amber-500 bg-white py-2.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50">
                    Go to Wallet
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
                  <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                {mockTransactions.length === 0 ? (
                  <p className="mt-6 text-center text-sm text-gray-500">
                    No transactions yet.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-amber-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-2 py-2 sm:px-3">Date</th>
                          <th className="px-2 py-2 sm:px-3">Description</th>
                          <th className="px-2 py-2 text-right sm:px-3">Amount</th>
                          <th className="px-2 py-2 sm:px-3">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTransactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-amber-50 last:border-0">
                            <td className="px-2 py-2 text-xs text-gray-500 sm:px-3">
                              {tx.date}
                            </td>
                            <td className="px-2 py-2 text-sm text-gray-800 sm:px-3">
                              {tx.description}
                            </td>
                            <td className="px-2 py-2 text-right text-sm font-medium sm:px-3">
                              <span
                                className={
                                  (tx.amount ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"
                                }
                              >
                                {formatAmount(Math.abs(tx.amount ?? 0))}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-xs text-gray-500 sm:px-3">
                              {tx.type}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {activePage === "wallet" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Wallet</h1>
                <p className="mt-1 text-sm text-gray-500">
                  View your balance and recent wallet transactions.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.5fr,2fr]">
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Wallet Balance
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-amber-700">
                    {formatAmount(mockUser.walletBalance)}
                  </p>
                  <button className="mt-5 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600">
                    Withdraw
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Withdrawals are processed as per Earnwale payout schedule.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Transaction History
                  </h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-amber-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-2 py-2 sm:px-3">Date</th>
                          <th className="px-2 py-2 sm:px-3">Description</th>
                          <th className="px-2 py-2 text-right sm:px-3">Amount</th>
                          <th className="px-2 py-2 sm:px-3">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTransactions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-2 py-6 text-center text-sm text-gray-500 sm:px-3"
                            >
                              No wallet transactions yet.
                            </td>
                          </tr>
                        ) : (
                          mockTransactions.map((tx) => (
                            <tr
                              key={tx.id}
                              className="border-b border-amber-50 last:border-0"
                            >
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-3">
                                {tx.date}
                              </td>
                              <td className="px-2 py-2 text-sm text-gray-800 sm:px-3">
                                {tx.description}
                              </td>
                              <td className="px-2 py-2 text-right text-sm font-medium sm:px-3">
                                <span
                                  className={
                                    (tx.amount ?? 0) >= 0
                                      ? "text-emerald-600"
                                      : "text-red-600"
                                  }
                                >
                                  {formatAmount(Math.abs(tx.amount ?? 0))}
                                </span>
                              </td>
                              <td className="px-2 py-2 text-xs text-gray-500 sm:px-3">
                                {tx.type}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === "affiliate" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Affiliate Panel</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your referral link and see your commission breakdown.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[2fr,1.4fr]">
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">
                        Referral Link
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Share this link with your audience.
                      </p>
                    </div>
                    <button
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600"
                      onClick={() => handleCopy(mockUser.referralLink, "link")}
                    >
                      {copiedLink ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-4 max-w-full overflow-x-auto rounded-xl bg-amber-50 px-4 py-3 text-xs text-gray-900 sm:text-sm">
                    {mockUser.referralLink}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Referral Stats
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-amber-50 px-4 py-3">
                      <p className="text-xs text-gray-500">Total Referrals</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {mockUser.referralCount}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 px-4 py-3">
                      <p className="text-xs text-gray-500">Total Earnings</p>
                      <p className="mt-1 text-lg font-semibold text-amber-700">
                        {formatAmount(mockUser.totalEarned)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-sm font-semibold text-gray-900">
                  Commission Breakdown
                </h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-amber-50 text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-2 py-2 sm:px-3">Plan</th>
                        <th className="px-2 py-2 sm:px-3">Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCommission.map((row) => (
                        <tr
                          key={row.plan}
                          className="border-b border-amber-50 last:border-0"
                        >
                          <td className="px-2 py-2 text-sm text-gray-800 sm:px-3">
                            {row.plan}
                          </td>
                          <td className="px-2 py-2 text-sm font-medium text-amber-700 sm:px-3">
                            {row.reward}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activePage === "leaderboard" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Leaderboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  See how you compare with top Earnwale affiliates.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Top 10 Earners
                  </h2>
                  <span className="text-xs text-gray-500">Mock data</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-amber-50 text-xs uppercase tracking-wide text-gray-500">
                        <th className="px-2 py-2 sm:px-3">Rank</th>
                        <th className="px-2 py-2 sm:px-3">Affiliate</th>
                        <th className="px-2 py-2 text-right sm:px-3">Total Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockLeaderboard.map((row) => (
                        <tr
                          key={row.rank}
                          className="border-b border-amber-50 last:border-0"
                        >
                          <td className="px-2 py-2 text-sm sm:px-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                row.rank === 1
                                  ? "bg-amber-500/10 text-amber-700"
                                  : row.rank <= 3
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              #{row.rank}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-sm text-gray-800 sm:px-3">
                            {row.name}
                          </td>
                          <td className="px-2 py-2 text-right text-sm font-medium text-amber-700 sm:px-3">
                            {formatAmount(row.totalEarned)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activePage === "profile" && (
            <section className="space-y-6">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl">Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your Earnwale account information.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr,2fr]">
                <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-lg font-semibold text-white">
                      {mockUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {mockUser.name}
                      </p>
                      <p className="text-sm text-gray-500">{mockUser.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Plan:</span> {mockUser.plan}
                    </p>
                    <p>
                      <span className="font-medium">Referral code:</span>{" "}
                      {mockUser.referralCode}
                    </p>
                  </div>
                  <button className="mt-5 w-full rounded-xl border border-amber-500 bg-white py-2.5 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50">
                    Edit Profile
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Security notice
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                      Keep your referral code and login details safe. Never share
                      your password or one-time codes with anyone claiming to be
                      from Earnwale.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Account summary
                    </h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-amber-50 px-4 py-3">
                        <p className="text-xs text-gray-500">Total earned</p>
                        <p className="mt-1 text-lg font-semibold text-amber-700">
                          {formatAmount(mockUser.totalEarned)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 px-4 py-3">
                        <p className="text-xs text-gray-500">Current earnings</p>
                        <p className="mt-1 text-lg font-semibold text-amber-700">
                          {formatAmount(mockUser.currentEarnings)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
