"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const linkClass = "text-sm text-gray-600 hover:text-gray-900";
const joinClass =
  "rounded-xl bg-amber-500 px-2.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 sm:px-4 whitespace-nowrap";

function CoursesNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <Link
      href="/#courses"
      className={linkClass}
      onClick={(e) => {
        onNavigate?.();
        if (pathname === "/") {
          e.preventDefault();
          document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(null, "", "#courses");
        }
      }}
    >
      Courses
    </Link>
  );
}

export default function SiteNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between gap-2 px-4 sm:h-16">
        <Link
          href="/"
          className="min-w-0 shrink-0 truncate text-base font-semibold text-gray-900 sm:text-lg"
          onClick={closeMenu}
        >
          Earnwale
        </Link>

        <div className="hidden min-w-0 items-center gap-4 md:flex md:gap-6">
          <Link href="/" className={linkClass}>
            Home
          </Link>
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <CoursesNavLink />
          <Link href="/contact" className={linkClass}>
            Contact
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-gray-600 hover:bg-amber-50 hover:text-gray-900 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
          <Link href="/login" className={`${linkClass} whitespace-nowrap`} onClick={closeMenu}>
            Login
          </Link>
          <Link href="/signup" className={joinClass} onClick={closeMenu}>
            Join Now
          </Link>
        </div>
      </div>

      {menuOpen ? (
        <div className="flex flex-col gap-3 border-t border-amber-100 bg-white px-4 py-3 md:hidden">
          <Link href="/" className={linkClass} onClick={closeMenu}>
            Home
          </Link>
          <Link href="/about" className={linkClass} onClick={closeMenu}>
            About
          </Link>
          <CoursesNavLink onNavigate={closeMenu} />
          <Link href="/contact" className={linkClass} onClick={closeMenu}>
            Contact
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
