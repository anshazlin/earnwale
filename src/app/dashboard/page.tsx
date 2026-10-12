"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Account = {
  plan?: string | number | null;
};

export default function DashboardHomePage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unable to load account");
        return res.json();
      })
      .then((data) => {
        if (alive) setAccount(data?.user ?? null);
      })
      .catch(() => {
        if (alive) setAccount(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const plan = String(account?.plan ?? "").trim();
  const hasStarter = plan === "300" || plan === "500";
  const hasPro = plan === "500";

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-5">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
          Earnwale Trading Academy
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {plan ? "My courses" : "Trading courses"}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          {plan
            ? "Open only the courses included with your paid enrollment."
            : "Your Affiliate Program membership does not unlock paid learning content. Buy a course only if you want the educational product."}
        </p>
      </header>

      <div
        className="grid gap-4 sm:grid-cols-2"
        aria-label="Earnwale trading courses"
      >
        <CourseCard
          eyebrow="Starter · ₹300"
          title="Trading Fundamentals"
          description="Six beginner video lessons, two learning PDFs and a rotating eight-question Starter assessment."
          dark
          owned={hasStarter}
          href={hasStarter ? "/dashboard/my-courses" : "/signup?plan=300"}
        />
        <CourseCard
          eyebrow="Pro · ₹500"
          title="Practical Trading Education"
          description="Includes Starter, plus six Pro video lessons, five practical PDFs and a separate Pro assessment."
          owned={hasPro}
          unavailable={plan === "300"}
          href={hasPro ? "/dashboard/pro" : plan ? "#" : "/signup?plan=500"}
        />
      </div>

      {plan === "300" && (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600">
          Your current enrollment is Starter. A separate upgrade checkout has not
          been enabled, so Pro content remains locked.
        </p>
      )}

      {!plan && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
          Affiliate participation is free and optional. It remains separate from
          course ownership.
        </div>
      )}
    </div>
  );
}

function CourseCard({
  eyebrow,
  title,
  description,
  dark = false,
  owned,
  unavailable = false,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark?: boolean;
  owned: boolean;
  unavailable?: boolean;
  href: string;
}) {
  const content = (
    <>
      <div
        className={
          dark
            ? "rounded-xl bg-[#071B33] px-4 py-5 text-white"
            : "rounded-xl bg-slate-100 px-4 py-5"
        }
      >
        <p
          className={
            dark
              ? "text-xs font-bold uppercase tracking-[0.16em] text-amber-300"
              : "text-xs font-bold uppercase tracking-[0.16em] text-amber-700"
          }
        >
          {eyebrow}
        </p>
        <h2
          className={
            dark
              ? "mt-2 text-xl font-bold leading-snug"
              : "mt-2 text-xl font-bold leading-snug text-slate-950"
          }
        >
          {title}
        </h2>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-700">{description}</p>
      <span className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 pt-6 text-sm font-bold text-amber-800">
        {owned
          ? "Open course"
          : unavailable
            ? "Not included in current plan"
            : "View enrollment"}
        {!unavailable && <span aria-hidden="true" className="text-xl">→</span>}
      </span>
    </>
  );

  const classes =
    "group flex min-w-0 flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm transition sm:p-6";

  if (unavailable) {
    return <div className={classes + " opacity-75"}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={
        classes +
        " hover:border-amber-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      }
    >
      {content}
    </Link>
  );
}
