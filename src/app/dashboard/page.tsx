import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-5">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
          Earnwale Trading Academy
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          My courses
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Choose a course to open its own learning page. Videos, PDFs, quizzes and saved
          assessment results are inside each course—not on Home.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2" aria-label="Choose your trading course">
        <Link
          href="/dashboard/my-courses"
          className="group flex min-w-0 flex-col rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm transition hover:border-amber-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:p-6"
        >
          <div className="rounded-xl bg-[#071B33] px-4 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
              Starter · ₹300
            </p>
            <h2 className="mt-2 text-xl font-bold leading-snug">Trading Fundamentals</h2>
            <p className="mt-2 text-sm text-blue-100">Learn the essentials step by step.</p>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-700">
            Six beginner video lessons, two learning PDFs and your own rotating
            eight-question Starter assessment.
          </p>
          <span className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 pt-6 text-sm font-bold text-amber-800">
            Open Starter course <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>

        <Link
          href="/dashboard/pro"
          className="group flex min-w-0 flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:p-6"
        >
          <div className="rounded-xl bg-slate-100 px-4 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
              Pro · ₹500
            </p>
            <h2 className="mt-2 text-xl font-bold leading-snug text-slate-950">
              Practical Trading Education
            </h2>
            <p className="mt-2 text-sm text-slate-600">Go deeper with practical exercises.</p>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-700">
            Includes Starter, plus six Pro video lessons, five practical PDFs
            and a separate eight-question Pro assessment.
          </p>
          <span className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 pt-6 text-sm font-bold text-amber-800">
            Open Pro course <span aria-hidden="true" className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Course content is available according to your enrolled plan. Pro lessons require a Pro account.
      </p>
    </div>
  );
}
