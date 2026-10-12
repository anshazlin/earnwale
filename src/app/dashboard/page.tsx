"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StarterCourse from "./my-courses/page";
import ProCourse from "./pro/page";

type Course = "starter" | "pro";
type Account = { plan?: number | string };

export default function DashboardHomePage() {
  const [selected, setSelected] = useState<Course>("starter");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadAccount() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        if (!response.ok) throw new Error("Account unavailable");
        const data = await response.json();
        const account: Account = data.user ?? data;
        if (!controller.signal.aborted) {
          setPlan(String(account.plan ?? ""));
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadAccount();
    return () => controller.abort();
  }, []);

  const hasStarter = plan === "300" || plan === "500";
  const hasPro = plan === "500";

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center" role="status">
    <span aria-label="Loading your courses" className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
  </div>;

  if (error) return <section className="rounded-2xl border border-slate-200 bg-white p-6">
    <h1 className="text-xl font-bold text-slate-900">Could not load your courses</h1>
    <p className="mt-2 text-sm text-slate-600">Please try again. Your lessons and progress are still saved.</p>
    <button type="button" onClick={() => window.location.reload()}
      className="mt-4 rounded-xl bg-[#071B33] px-5 py-3 text-sm font-semibold text-white">Retry</button>
  </section>;

  return <div className="space-y-6 pb-4">
    <header className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Earnwale Trading Academy</p>
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My courses</h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        Choose Starter or Pro below. Your lessons, PDF resources, assessments and saved scores stay together in Home.
      </p>
    </header>

    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Choose your trading course">
      <button
        type="button"
        onClick={() => setSelected("starter")}
        aria-pressed={selected === "starter"}
        className={`min-w-0 rounded-2xl border-2 p-5 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${selected === "starter" ? "border-amber-400 bg-[#071B33] text-white" : "border-slate-200 bg-white text-slate-900 hover:border-amber-300"}`}
      >
        <span className={`text-xs font-bold uppercase tracking-[0.16em] ${selected === "starter" ? "text-amber-300" : "text-amber-700"}`}>Starter · ₹300</span>
        <span className="mt-2 block text-xl font-bold">Trading Fundamentals</span>
        <span className={`mt-2 block text-sm leading-6 ${selected === "starter" ? "text-blue-100" : "text-slate-600"}`}>
          6 video lessons · 2 PDFs · 8-question quiz
        </span>
        <span className={`mt-4 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${selected === "starter" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"}`}>
          {hasStarter ? (selected === "starter" ? "Viewing Starter" : "Open Starter →") : "Not enrolled"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setSelected("pro")}
        aria-pressed={selected === "pro"}
        className={`min-w-0 rounded-2xl border-2 p-5 text-left shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${selected === "pro" ? "border-amber-400 bg-[#071B33] text-white" : "border-slate-200 bg-white text-slate-900 hover:border-amber-300"}`}
      >
        <span className={`text-xs font-bold uppercase tracking-[0.16em] ${selected === "pro" ? "text-amber-300" : "text-amber-700"}`}>Pro · ₹500</span>
        <span className="mt-2 block text-xl font-bold">Practical Trading Education</span>
        <span className={`mt-2 block text-sm leading-6 ${selected === "pro" ? "text-blue-100" : "text-slate-600"}`}>
          Starter included + 6 Pro videos · 5 Pro PDFs · Pro quiz
        </span>
        <span className={`mt-4 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${selected === "pro" ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700"}`}>
          {hasPro ? (selected === "pro" ? "Viewing Pro" : "Open Pro →") : "Pro membership required"}
        </span>
      </button>
    </div>

    <section aria-label={selected === "starter" ? "Starter course content" : "Pro course content"}>
      {selected === "starter"
        ? hasStarter
          ? <StarterCourse />
          : <div className="rounded-2xl border border-amber-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-900">Starter access</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Enroll in Trading Academy Starter or Pro to access the Starter lessons and quiz.</p>
              <Link href="/#courses" className="mt-4 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950">View plans</Link>
            </div>
        : hasPro
          ? <ProCourse />
          : <div className="rounded-2xl border border-amber-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-900">Pro lessons are for Pro members</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your Starter lessons remain available above. Pro includes six additional videos, practical PDFs and its own quiz. New Pro enrollment opens after launch approval.</p>
              <button type="button" onClick={() => setSelected("starter")}
                className="mt-4 rounded-xl bg-[#071B33] px-5 py-3 text-sm font-semibold text-white">Return to Starter</button>
            </div>}
    </section>
  </div>;
}
