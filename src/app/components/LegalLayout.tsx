import Link from "next/link";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function LegalLayout({ children, title }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            Earnwale
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:py-16">
        <article className="max-w-none">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            {title}
          </h1>
          <div className="mt-6 space-y-6 text-gray-700 [&_h2]:mt-10 [&_h2]:border-b [&_h2]:border-amber-100 [&_h2]:pb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/terms-and-conditions" className="text-gray-600 hover:text-amber-600">
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-amber-600">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="text-gray-600 hover:text-amber-600">
              Refund Policy
            </Link>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Earnwale. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
