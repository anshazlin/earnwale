"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type User = {
  name?: string;
  email?: string;
  plan?: number;
};

const SCHOLAR = {
  title: "The Scholar's Protocol",
  subtitle: "Advanced Cognitive Strategies for High-Performance Learning",
  description:
    "Master focus systems, memory frameworks, and cognitive performance strategies designed for ambitious students.",
  learn: [
    "Deep focus systems",
    "Memory optimization frameworks",
    "Strategic study planning",
    "High-performance learning habits",
  ],
  image: "/images/scholar.jpg",
  download: "/api/download?file=scholar",
};

const CAPITAL = {
  title: "The Capital Compounder",
  subtitle: "Advanced Financial Engineering for the Modern Student",
  description:
    "Learn structured financial thinking, capital growth models, and long-term wealth systems.",
  learn: [
    "Capital growth strategy",
    "Financial decision models",
    "Risk & reward structure",
    "Wealth-building psychology",
  ],
  image: "/images/capital.jpg",
  download: "/api/download?file=capital",
};

function CourseCard({
  title,
  subtitle,
  description,
  learn,
  image,
  download,
}: {
  title: string;
  subtitle: string;
  description: string;
  learn: string[];
  image: string;
  download: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6 pb-0 sm:p-7 sm:pb-0">
        <Image
          src={image}
          alt={title}
          width={1200}
          height={720}
          className="w-full h-64 object-cover rounded-xl"
          priority
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Lifetime Digital Access
          </span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1 text-sm font-medium text-amber-700">{subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {description}
        </p>

        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            What You&apos;ll Learn
          </h3>
          <ul className="mt-3 space-y-2">
            {learn.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-1 items-end">
          <a
            href={download}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Ebook
          </a>
        </div>
      </div>
    </article>
  );
}

export default function MyCoursesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setUser(data?.user ?? data);
    } catch {
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const plan = Number(user?.plan);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          My Courses
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Access your purchased digital programs.
        </p>
      </div>

      {!plan ? (
        <div className="rounded-2xl border border-amber-100 bg-white p-10 shadow-sm sm:p-12">
          <p className="text-center text-gray-600">
            No courses purchased yet.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-8 sm:gap-10 ${plan === 300 ? "max-w-2xl" : "sm:grid-cols-2 lg:gap-10"}`}
        >
          {/* Scholar's Protocol - 300 & 500 users */}
          {(plan === 300 || plan === 500) && (
            <CourseCard
              title={SCHOLAR.title}
              subtitle={SCHOLAR.subtitle}
              description={SCHOLAR.description}
              learn={SCHOLAR.learn}
              image={SCHOLAR.image}
              download={SCHOLAR.download}
            />
          )}

          {/* The Capital Compounder - 500 users only */}
          {plan === 500 && (
            <CourseCard
              title={CAPITAL.title}
              subtitle={CAPITAL.subtitle}
              description={CAPITAL.description}
              learn={CAPITAL.learn}
              image={CAPITAL.image}
              download={CAPITAL.download}
            />
          )}
        </div>
      )}
    </div>
  );
}
