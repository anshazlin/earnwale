import Link from "next/link";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  children: ReactNode;
  title: string;
};

export default function LegalLayout({ children, title }: LegalLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <nav className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4 sm:h-16">
          <Link href="/" className="text-base font-semibold text-gray-900">
            Earnwale
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Home
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
        </div>
      </nav>

      <main className="mx-auto w-full max-w-screen-md px-4 py-6">
        <article className="w-full max-w-full">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {title}
          </h1>
          <div className="mt-6 space-y-4 text-sm text-gray-700 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-gray-200 bg-gray-50 py-6">
        <div className="mx-auto w-full max-w-screen-md px-4">
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
