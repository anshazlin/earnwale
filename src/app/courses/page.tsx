"use client";

import { useEffect } from "react";

/** Legacy URL: send users to the homepage plans section. */
export default function CoursesLegacyRedirect() {
  useEffect(() => {
    window.location.replace("/#courses");
  }, []);

  return (
    <p className="mx-auto max-w-screen-md px-4 py-10 text-center text-sm text-gray-600">
      Redirecting to courses…
    </p>
  );
}
