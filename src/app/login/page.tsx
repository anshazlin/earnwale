"use client";

import { SiteNavbar } from "@/components/SiteNavbar";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("FETCH STARTING");
    console.log("LOGIN CLICKED");
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
   try {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: email.trim(), password }),
  });

  console.log("STATUS:", res.status);

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    console.log("No JSON body");
  }

  if (!res.ok) {
    setError(data?.error || "Login failed");
    setLoading(false);
    return;
  }

  window.location.href = "/dashboard/my-courses";
} catch (err) {
  console.log("FETCH ERROR:", err);
  setError("Something went wrong");
  setLoading(false);
}
  };

  const inputBase =
    "w-full max-w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 box-border";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteNavbar />

      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-screen-md items-center justify-center px-4 py-6">
        <div className="w-full max-w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in…
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-amber-600 hover:text-amber-700">
              Enroll now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
