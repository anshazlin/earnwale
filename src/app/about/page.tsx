import Link from "next/link";

export default function About() {
  const team = [
    { id: "1", name: "Aisha Khan", role: "Founder & CEO", bio: "Building meaningful learning experiences.", img: "/" },
    { id: "2", name: "Ravi Patel", role: "Head of Curriculum", bio: "Designs hands-on, industry-aligned courses.", img: "/" },
    { id: "3", name: "Maya Gomez", role: "Community Manager", bio: "Supports learners and instructors.", img: "/" },
  ];

  return (
    <main className="mx-auto w-full max-w-screen-md px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">About Earnwale</h1>
        <p className="mt-2 text-sm text-gray-600">We create practical courses and tools that help learners level up their careers.</p>
      </header>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Our Mission</h2>
        <p className="text-sm text-gray-700">
          To make high-quality, job-ready education accessible and affordable. We focus on hands-on learning,
          mentorship, and real-world projects so learners can demonstrate skills to employers.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">What We Value</h2>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>Practical, project-driven learning</li>
          <li>Community and mentorship</li>
          <li>Transparency and measurable outcomes</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Meet the Team</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {team.map((member) => (
            <article key={member.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3 items-center">
                <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200" />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900">{member.name}</div>
                  <div className="text-xs text-gray-500">{member.role}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-2">Get In Touch</h2>
        <p className="text-sm text-gray-700">Have questions about courses, partnerships, or careers? <Link href="/contact" className="font-medium text-amber-600 hover:text-amber-700">Contact us</Link>.</p>
      </section>
    </main>
  );
}