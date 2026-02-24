"use client";

import React, { useMemo, useState } from "react";

type Course = {
  id: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  price: string;
};

const SAMPLE_COURSES: Course[] = [
  {
    id: "react-101",
    title: "React for Beginners",
    category: "Web Development",
    level: "Beginner",
    description: "Learn the fundamentals of React, components, state, and hooks.",
    price: "$29",
  },
  {
    id: "node-api",
    title: "Building APIs with Node.js",
    category: "Backend",
    level: "Intermediate",
    description: "Design and implement RESTful APIs using Node.js and Express.",
    price: "$39",
  },
  {
    id: "fullstack-bootcamp",
    title: "Fullstack Bootcamp",
    category: "Fullstack",
    level: "Advanced",
    description: "End-to-end web app building, deployment, and best practices.",
    price: "$99",
  },
  {
    id: "python-data",
    title: "Python for Data Analysis",
    category: "Data Science",
    level: "Beginner",
    description: "Intro to data analysis with pandas and visualization.",
    price: "$35",
  },
  {
    id: "aws-basics",
    title: "Cloud Fundamentals (AWS)",
    category: "Cloud",
    level: "Intermediate",
    description: "Foundational AWS services, architecture, and deployment.",
    price: "$45",
  },
];

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [level, setLevel] = useState<string>("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(SAMPLE_COURSES.map((c) => c.category)))], []);
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = useMemo(() => {
    return SAMPLE_COURSES.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (level !== "All" && c.level !== (level as Course["level"])) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (c.title + " " + c.description + " " + c.category).toLowerCase().includes(q);
    });
  }, [query, category, level]);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 6 }}>Courses</h1>
      <p style={{ marginTop: 0, marginBottom: 20 }}>Browse available courses — filter by category or level, or search by name.</p>

      <section style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          aria-label="Search courses"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses"
          style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minWidth: 220 }}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((course) => (
          <article key={course.id} style={{ border: "1px solid #e6e6e6", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: "0 0 8px 0" }}>{course.title}</h3>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>{course.category} • {course.level}</div>
              <p style={{ margin: 0, color: "#333" }}>{course.description}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <strong>{course.price}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={`/courses/${course.id}`} style={{ padding: "6px 10px", borderRadius: 6, background: "#0070f3", color: "white", textDecoration: "none" }}>View</a>
                <button style={{ padding: "6px 10px", borderRadius: 6 }} onClick={() => alert(`Enroll: ${course.title}`)}>
                  Enroll
                </button>
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", color: "#666" }}>No courses found.</div>}
      </section>
    </main>
  );
}