"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim().toLowerCase());
    } catch {}
    setMessage("If an account exists for that email, a password reset link has been sent.");
    setLoading(false);
  }

  return <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Reset password</h1>
      <p className="mt-2 text-sm text-gray-500">Enter your account email to receive a secure Firebase password reset link.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="you@example.com" />
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <button disabled={loading} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <Link href="/login" className="mt-4 block text-center text-sm text-amber-600">Back to login</Link>
    </div>
  </main>;
}
