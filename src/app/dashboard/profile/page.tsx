"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  name?: string;
  email?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setUser(data?.user ?? data);
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordMessage({
          type: "error",
          text: data?.error || "Failed to update password.",
        });
        return;
      }
      setPasswordMessage({ type: "success", text: "Password updated." });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setPasswordMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View your account details and change password.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Account details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Name
            </label>
            <input
              type="text"
              readOnly
              value={user?.name ?? ""}
              className={inputClass + " bg-gray-50 read-only:cursor-default"}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Email
            </label>
            <input
              type="email"
              readOnly
              value={user?.email ?? ""}
              className={inputClass + " bg-gray-50 read-only:cursor-default"}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Current password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              className={inputClass}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              New password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              className={inputClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Confirm new password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  confirmPassword: e.target.value,
                }))
              }
              className={inputClass}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          {passwordMessage && (
            <p
              className={
                passwordMessage.type === "success"
                  ? "text-sm text-emerald-600"
                  : "text-sm text-red-600"
              }
            >
              {passwordMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-70"
          >
            {passwordLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
