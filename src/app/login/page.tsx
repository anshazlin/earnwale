"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-10 h-16 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-base font-semibold text-gray-900">
            Earnwale
          </Link>
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <Link href="/" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Home
            </Link>
            <Link href="/courses" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Courses
            </Link>
            <Link href="/about" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              About Us
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Contact Us
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              Enroll Now
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3.5 text-base font-semibold text-white shadow-md shadow-amber-500/30 transition-all duration-200 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
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
