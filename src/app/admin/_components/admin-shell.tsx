"use client";

import { useState } from "react";
import { AdminSidebar } from "./sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 md:hidden">
        <span className="font-semibold text-gray-900">Admin</span>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="text-2xl leading-none text-gray-700"
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="md:flex">
        <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex-1 md:pl-64">{children}</div>
      </div>
    </div>
  );
}
