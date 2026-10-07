"use client";

import { useState } from "react";
import { AdminSidebar } from "./sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:hidden">
        <div><p className="text-sm font-bold">Earnwale Admin</p><p className="text-[11px] text-slate-500">Control center</p></div>
        <button type="button" onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm" aria-label="Open menu">☰</button>
      </div>
      {sidebarOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] md:hidden" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="min-w-0 md:pl-[280px]">{children}</main>
    </div>
  );
}
