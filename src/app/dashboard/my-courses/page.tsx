"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  name?: string;
  email?: string;
  plan?: string;
};

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

  const hasPlan = user?.plan && String(user.plan).trim() !== "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          My Courses
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your purchased courses and learning access.
        </p>
      </div>

      {!hasPlan ? (
        <div className="rounded-2xl border border-amber-100 bg-white p-8 shadow-sm">
          <p className="text-center text-gray-600">
            No courses purchased yet.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {user?.plan ?? "—"}
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              Access Course
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
