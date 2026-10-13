"use client";

import Link from "next/link";
import SiteNavbar from "@/app/components/SiteNavbar";

export default function AffiliateProgramPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <SiteNavbar />
      <main className="mx-auto w-full max-w-screen-md px-4 py-8 sm:py-12">
        <section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            Optional affiliate program
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Recommend Earnwale courses and earn from qualifying sales.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Affiliate registration is handled only inside your logged-in Earnwale
            dashboard. Creating an account is free, and buying a course is not
            required to join the Affiliate Program.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Starter sale
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">₹220</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Commission on a qualifying ₹300 course sale.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Pro sale
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-950">₹400</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Commission on a qualifying ₹500 course sale.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">
            Single-level only. No joining bonus, recruitment commission,
            downline, guaranteed income, ROI or payment for simply creating an
            account.
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950"
            >
              Login to dashboard
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-amber-300 bg-white px-4 py-3 text-sm font-semibold text-amber-800"
            >
              Create free account
            </Link>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            After login, open your personal dashboard and choose
            &ldquo;Join Affiliate Program&rdquo; to accept the Affiliate Terms
            and activate your affiliate link.
          </p>
        </section>
      </main>
    </div>
  );
}
