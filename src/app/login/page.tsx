"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import("firebase/auth");
      const { firebaseAuth } = await import("@/lib/firebase-client");
      let credential;
      try {
        credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
      } catch (firebaseError: any) {
        if (["auth/user-not-found", "auth/invalid-credential", "auth/invalid-login-credentials"].includes(firebaseError?.code)) {
          const migration = await fetch("/api/auth/migrate-legacy", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail, password }),
          });
          if (!migration.ok) throw firebaseError;
          credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
        } else throw firebaseError;
      }

      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        await signOut(firebaseAuth);
        setError("Please verify your email. We sent you a verification link.");
        return;
      }

      const idToken = await credential.user.getIdToken(true);
      const session = await fetch("/api/auth/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ idToken }),
      });
      const data = await session.json().catch(() => ({}));
      if (!session.ok) throw new Error(data?.error || "Login failed");
      await signOut(firebaseAuth);
      window.location.href = data?.isAdmin ? "/admin" : "/dashboard";
    } catch (err: any) {
      setError(err?.message === "Login failed" ? err.message : "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full max-w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 box-border";

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4">
          <Link href="/" className="text-base font-semibold text-gray-900">
            Earnwale
          </Link>
          <Link href="/signup" className="rounded-lg border border-amber-500 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50">
            Enroll
          </Link>
        </div>
      </header>

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

            <div className="flex items-center justify-between">
              <span></span><Link href="/forgot-password" className="text-xs font-medium text-amber-600 hover:text-amber-700">Forgot password?</Link>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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
