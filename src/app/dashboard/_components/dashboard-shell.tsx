"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type DashboardShellProps = { children: ReactNode };
type IconName = "home" | "wallet" | "dashboard";

const NAV_ITEMS: Array<{ name: string; href: string; icon: IconName }> = [
  { name: "Home", href: "/dashboard", icon: "home" },
  { name: "Wallet", href: "/dashboard/wallet", icon: "wallet" },
  { name: "Dashboard", href: "/dashboard/personal", icon: "dashboard" },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function activeFor(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function sectionName(pathname: string) {
  if (pathname.startsWith("/dashboard/profile")) return "Account";
  if (pathname.startsWith("/dashboard/support")) return "Support";
  return NAV_ITEMS.find((item) => activeFor(pathname, item.href))?.name ?? "Earnwale";
}

function NavIcon({ name }: { name: IconName }) {
  const common = "h-5 w-5";

  if (name === "home") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="14" rx="3" />
        <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
        <path d="M7 6V4h10v2" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname() ?? "/dashboard";
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.replace("/login");
      router.refresh();
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-amber-100 bg-white md:flex md:flex-col">
          <div className="flex h-20 items-center gap-3 px-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-bold text-slate-950">E</div>
              <div>
                <p className="font-semibold text-slate-950">Earnwale</p>
                <p className="text-xs text-slate-500">Learning account</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {NAV_ITEMS.map((item) => {
              const active = activeFor(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  className={cx(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-amber-100 text-amber-900"
                      : "text-slate-600 hover:bg-amber-50 hover:text-slate-950",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      active
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <NavIcon name={item.icon} />
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-3">
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {logoutLoading ? "Logging out…" : "Logout"}
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link href="/dashboard" prefetch className="font-semibold tracking-tight text-slate-950">
                Earnwale
              </Link>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 md:hidden">
                {sectionName(pathname)}
              </span>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-28 sm:px-6 sm:py-7 md:pb-7">
              {children}
            </div>
          </main>

          <MobileNav pathname={pathname} />
        </div>
      </div>
    </div>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-100 bg-white/98 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {NAV_ITEMS.map((item) => {
          const active = activeFor(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cx(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition active:scale-[0.98]",
                active ? "bg-amber-100 text-amber-900" : "text-slate-500",
              )}
            >
              <span
                className={cx(
                  "flex h-7 w-7 items-center justify-center rounded-xl",
                  active ? "bg-amber-400 text-slate-950" : "text-slate-500",
                )}
              >
                <NavIcon name={item.icon} />
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
