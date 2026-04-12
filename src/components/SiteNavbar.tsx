"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function scrollToCoursesSection() {
  document.getElementById("courses")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const coursesClick = (e: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      scrollToCoursesSection();
      window.history.replaceState(null, "", "/#courses");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4 sm:h-16">
        <Link href="/" className="text-sm font-semibold text-gray-900 sm:text-lg">
          Earnwale
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-0">
          <div className="hidden items-center gap-6 sm:flex">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/#courses" className="text-sm text-gray-600 hover:text-gray-900" onClick={coursesClick}>
              Courses
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              Join Now
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              Join Now
            </Link>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-700 hover:bg-amber-50"
            >
              {menuOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-amber-100 bg-white px-4 py-3 sm:hidden">
          <div className="mx-auto flex max-w-screen-md flex-col gap-3">
            <Link
              href="/"
              className="text-sm text-gray-700 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-700 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link href="/#courses" className="text-sm text-gray-700 hover:text-gray-900" onClick={coursesClick}>
              Courses
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-700 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
