"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Withdrawals", href: "/admin/withdraw" },
  { label: "Transactions", href: "/admin/transactions" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white/95 px-5 py-6 shadow-sm backdrop-blur md:flex md:flex-col">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <span className="text-sm font-semibold">EA</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            Earnwale Admin
          </span>
          <span className="text-xs text-slate-500">Control Panel</span>
        </div>
      </div>

      <nav className="space-y-1 text-sm">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-xl px-3 py-2.5 font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

