"use client";

import { useState } from "react";
import Link from "next/link";
import SiteNavbar from "@/app/components/SiteNavbar";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 8) {
      setMessage({
        type: "error",
        text: "Enter a valid email and use at least 8 password characters.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const {
        createUserWithEmailAndPassword,
        deleteUser,
        sendEmailVerification,
        signOut,
      } = await import("firebase/auth");
      const { firebaseAuth } = await import("@/lib/firebase-client");

      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        normalizedEmail,
        password,
      );

      try {
        const idToken = await credential.user.getIdToken(true);
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          await deleteUser(credential.user).catch(() => undefined);
          throw new Error(data?.error || "Unable to create account");
        }

        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
        }
        await signOut(firebaseAuth).catch(() => undefined);

        setPassword("");
        setMessage({
          type: "success",
          text: "Account created. Verify your email, then log in. You can join the Affiliate Program from your dashboard after login.",
        });
      } catch (error) {
        await signOut(firebaseAuth).catch(() => undefined);
        throw error;
      }
    } catch (error: unknown) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code ?? "")
          : "";
      const errorMessage = error instanceof Error ? error.message : "";

      setMessage({
        type: "error",
        text:
          code === "auth/email-already-in-use"
            ? "That email already has an Earnwale account. Please log in."
            : errorMessage || "Unable to create account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNavbar />
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Free Earnwale account
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Creating an account is free. Course purchases and Affiliate Program
            enrollment are separate choices.
          </p>

          <form onSubmit={register} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-amber-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>

          {message && (
            <p className={message.type === "success"
              ? "mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-medium leading-5 text-emerald-800"
              : "mt-4 rounded-2xl bg-rose-50 p-3 text-xs font-medium leading-5 text-rose-800"}>
              {message.text}
            </p>
          )}

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-amber-700">
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
