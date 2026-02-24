"use client";

import { useState } from "react";

type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function AdminPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    {
      id: "1",
      userId: "user_101",
      amount: 1200,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      userId: "user_102",
      amount: 800,
      status: "approved",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      userId: "user_103",
      amount: 1500,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleAction = (id: string, newStatus: "approved" | "rejected") => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: newStatus } : w
      )
    );
  };

  const totalUsers = 124;
  const totalEarnings = 84500;
  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status === "pending"
  ).length;
  const totalWithdrawalAmount = withdrawals.reduce(
    (sum, w) => sum + w.amount,
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8 text-indigo-600">
          Earnwale Admin
        </h2>
        <nav className="space-y-4">
          <p className="text-gray-700 font-medium cursor-pointer hover:text-indigo-600">
            Dashboard
          </p>
          <p className="text-gray-700 font-medium cursor-pointer hover:text-indigo-600">
            Users
          </p>
          <p className="text-gray-700 font-medium cursor-pointer hover:text-indigo-600">
            Withdrawals
          </p>
          <p className="text-gray-700 font-medium cursor-pointer hover:text-indigo-600">
            Transactions
          </p>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Dashboard Overview
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Total Earnings" value={`₹${totalEarnings}`} />
          <StatCard
            title="Pending Withdrawals"
            value={pendingWithdrawals}
          />
          <StatCard
            title="Total Withdrawals"
            value={`₹${totalWithdrawalAmount}`}
          />
        </div>

        {/* Withdrawals Table */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Withdrawal Requests
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3">User ID</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b hover:bg-slate-50">
                    <td className="py-3">{w.userId}</td>
                    <td className="py-3 font-medium">
                      ₹{w.amount}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="py-3">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {w.status === "pending" ? (
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              handleAction(w.id, "approved")
                            }
                            className="px-4 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction(w.id, "rejected")
                            }
                            className="px-4 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No actions
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-2">
        {value}
      </h3>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}