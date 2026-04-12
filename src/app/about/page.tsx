import Link from "next/link";
import SiteNavbar from "@/app/components/SiteNavbar";

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteNavbar />
      <main className="mx-auto w-full max-w-screen-md px-4 py-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">About Earnwale</h1>
          <p className="mt-2 text-sm text-gray-600">
            We create practical courses and tools that help learners level up their careers.
          </p>
        </header>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900">Our Mission</h2>
          <p className="text-sm text-gray-700">
            To make high-quality, job-ready education accessible and affordable. We focus on hands-on learning,
            mentorship, and real-world projects so learners can demonstrate skills to employers.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 text-base font-semibold text-gray-900">What We Value</h2>
          <ul className="list-disc space-y-1 pl-6 text-sm text-gray-700">
            <li>Practical, project-driven learning</li>
            <li>Community and mentorship</li>
            <li>Transparency and measurable outcomes</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-gray-900">Get In Touch</h2>
          <p className="text-sm text-gray-700">
            Have questions about courses, partnerships, or careers?{" "}
            <Link href="/contact" className="font-medium text-amber-600 hover:text-amber-700">
              Contact us
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
