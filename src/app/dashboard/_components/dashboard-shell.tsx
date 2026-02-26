"use client";

import { useState, type ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type DashboardShellProps = {
  children: ReactNode;
};

type NavItem = {
  name: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/dashboard" },
  { name: "Wallet", href: "/dashboard/wallet" },
  { name: "Withdraw", href: "/dashboard/withdraw" },
  { name: "Referrals", href: "/dashboard/referrals" },
  { name: "Profile", href: "/dashboard/profile" },
  { name: "Settings", href: "/dashboard/settings" },
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getSectionTitle(pathname: string) {
  const item =
    NAV_ITEMS.find((nav) => nav.href === pathname) ??
    NAV_ITEMS.find((nav) =>
      pathname.startsWith(nav.href === "/dashboard" ? "/dashboard" : `${nav.href}`),
    );
  return item?.name ?? "Dashboard";
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const sectionTitle = useMemo(
    () => (pathname ? getSectionTitle(pathname) : "Dashboard"),
    [pathname],
  );

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // swallow error; navigation below will rely on auth middleware
    } finally {
      router.push("/login");
      router.refresh();
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Mobile sidebar */}
      <div
        className={classNames(
          "fixed inset-0 z-40 flex md:hidden transition-opacity",
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!sidebarOpen}
      >
        <div
          className="fixed inset-0 bg-slate-900/40"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex w-72 max-w-full flex-1 flex-col bg-white shadow-xl">
          <Sidebar
            pathname={pathname ?? "/dashboard"}
            onNavigate={() => setSidebarOpen(false)}
            onLogout={handleLogout}
            logoutLoading={logoutLoading}
          />
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-amber-100 bg-white/90 backdrop-blur md:flex md:flex-col md:shadow-sm">
          <Sidebar
            pathname={pathname ?? "/dashboard"}
            onNavigate={() => undefined}
            onLogout={handleLogout}
            logoutLoading={logoutLoading}
          />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-100 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-amber-50 md:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <span className="sr-only">Open sidebar</span>
                  <div className="space-y-0.5">
                    <span className="block h-0.5 w-4 rounded-full bg-gray-700" />
                    <span className="block h-0.5 w-3 rounded-full bg-gray-500" />
                    <span className="block h-0.5 w-4 rounded-full bg-gray-700" />
                  </div>
                </button>
                <Link
                  href="/"
                  className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg"
                >
                  Earnwale
                </Link>
                <span className="hidden h-5 w-px bg-amber-100 sm:block" />
                <div className="hidden items-center gap-2 text-xs font-medium text-gray-500 sm:flex">
                  <span>Dashboard</span>
                  <span>/</span>
                  <span className="text-gray-700">{sectionTitle}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

type SidebarProps = {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  logoutLoading: boolean;
};

function Sidebar({ pathname, onNavigate, onLogout, logoutLoading }: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
            <span className="text-sm font-semibold">E</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Earnwale</span>
            <span className="text-xs text-gray-500">Creator Dashboard</span>
          </div>
        </Link>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-3 text-sm">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
            (item.href === "/dashboard" && pathname === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={classNames(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                "border border-transparent",
                isActive
                  ? "border-amber-200 bg-amber-50 text-amber-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 group-hover:bg-amber-500" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-amber-100 p-3">
        <button
          type="button"
          onClick={onLogout}
          disabled={logoutLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 shadow-sm transition-colors hover:bg-amber-100 disabled:opacity-70"
        >
          <span>{logoutLoading ? "Logging out…" : "Logout"}</span>
        </button>
      </div>
    </div>
  );
}

