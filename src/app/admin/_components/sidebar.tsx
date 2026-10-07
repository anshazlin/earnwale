"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type NavItem = { label: string; href: string; icon: string; hint: string };

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "⌂", hint: "Health & priorities" },
  { label: "Users", href: "/admin/users", icon: "◎", hint: "Accounts & plans" },
  { label: "Withdrawals", href: "/admin/withdraw", icon: "↗", hint: "Review payouts" },
  { label: "Transactions", href: "/admin/transactions", icon: "⇄", hint: "Money activity" },
];

type Props = { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void };

export function AdminSidebar({ sidebarOpen, setSidebarOpen }: Props) {
  const pathname = usePathname();
  useEffect(() => setSidebarOpen(false), [pathname, setSidebarOpen]);

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-slate-200/80 bg-white px-4 py-5 shadow-xl shadow-slate-900/5 transition-transform md:translate-x-0 md:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-full flex-col">
        <div className="mb-7 flex items-center justify-between px-2">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white">EW</div>
            <div><p className="text-sm font-bold text-slate-950">Earnwale</p><p className="text-xs text-slate-500">Admin control center</p></div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Close menu">×</button>
        </div>
        <nav className="space-y-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              <span className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${active ? "bg-white/10" : "bg-slate-100"}`}>{item.icon}</span>
              <span className="min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className={`block truncate text-[11px] ${active ? "text-slate-300" : "text-slate-400"}`}>{item.hint}</span></span>
            </Link>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-800">Secure admin session</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Sensitive actions remain protected by Firebase session verification.</p>
          <a href="/api/auth/logout" className="mt-3 block rounded-xl bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100">Sign out</a>
        </div>
      </div>
    </aside>
  );
}
