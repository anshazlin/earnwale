"use client";

import { useState } from "react";
import Link from "next/link";
import SiteNavbar from "@/app/components/SiteNavbar";

export default function AffiliateProgramPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const register = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 8 || !acceptTerms) {
      setMessage({
        type: "error",
        text: "Enter a valid email, use at least 8 password characters, and accept the Affiliate Terms.",
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
        const response = await fetch("/api/affiliate/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken, acceptTerms: true }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          await deleteUser(credential.user).catch(() => undefined);
          throw new Error(data?.error || "Unable to create affiliate account");
        }

        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
        }
        await signOut(firebaseAuth).catch(() => undefined);

        setPassword("");
        setMessage({
          type: "success",
          text: "Account created. Check your email and verify it, then sign in. Your free affiliate account activates after verified sign-in.",
        });
      } catch (error) {
        await signOut(firebaseAuth).catch(() => undefined);
        throw error;
      }
    } catch (error: any) {
      const code = String(error?.code ?? "");
      setMessage({
        type: "error",
        text:
          code === "auth/email-already-in-use"
            ? "That email already has an Earnwale account. Sign in and join the Affiliate Program from your dashboard."
            : error?.message || "Unable to create affiliate account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <SiteNavbar />
      <main className="mx-auto w-full max-w-screen-md px-4 py-8 sm:py-12">
        <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Optional affiliate program
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Recommend genuine Earnwale courses. Earn only from qualifying sales.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Joining is free. You do not need to buy a course to participate, and
            purchasing a course does not automatically enroll you as an affiliate.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Starter sale</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">₹220</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Commission on a qualifying ₹300 course sale.</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Pro sale</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">₹400</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Commission on a qualifying ₹500 course sale.</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
            Single-level only. No joining bonus, recruitment commission, downline,
            guaranteed income, ROI or payment for simply creating an account.
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-950">Create a free affiliate account</h2>
          <p className="mt-1 text-sm text-slate-600">
            Already have an Earnwale account?{" "}
            <Link href="/login" className="font-semibold text-amber-700 underline">
              Sign in
            </Link>{" "}
            and join from your dashboard instead.
          </p>

          <form onSubmit={register} className="mt-5 space-y-4">
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

            <label className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
                className="mt-1"
              />
              <span className="text-xs leading-5 text-slate-600">
                I agree to the{" "}
                <Link href="/affiliate-terms" className="font-semibold text-amber-700 underline">
                  Affiliate Program Terms
                </Link>
                . I understand that joining is free and earnings are not guaranteed.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Join Affiliate Program — Free"}
            </button>
          </form>

          {message && (
            <p className={message.type === "success"
              ? "mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-medium leading-5 text-emerald-800"
              : "mt-4 rounded-2xl bg-rose-50 p-3 text-xs font-medium leading-5 text-rose-800"}>
              {message.text}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
