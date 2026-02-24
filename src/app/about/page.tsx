export default function About() {
  const team = [
    { id: "1", name: "Aisha Khan", role: "Founder & CEO", bio: "Building meaningful learning experiences.", img: "/" },
    { id: "2", name: "Ravi Patel", role: "Head of Curriculum", bio: "Designs hands-on, industry-aligned courses.", img: "/" },
    { id: "3", name: "Maya Gomez", role: "Community Manager", bio: "Supports learners and instructors.", img: "/" },
  ];

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>About EarnWale</h1>
        <p style={{ marginTop: 6, color: "#555" }}>We create practical courses and tools that help learners level up their careers.</p>
      </header>

      <section style={{ marginBottom: 22 }}>
        <h2 style={{ marginBottom: 8 }}>Our Mission</h2>
        <p style={{ marginTop: 0, color: "#333" }}>
          To make high-quality, job-ready education accessible and affordable. We focus on hands-on learning,
          mentorship, and real-world projects so learners can demonstrate skills to employers.
        </p>
      </section>

      <section style={{ marginBottom: 22 }}>
        <h2 style={{ marginBottom: 8 }}>What We Value</h2>
        <ul style={{ paddingLeft: 18, color: "#333" }}>
          <li>Practical, project-driven learning</li>
          <li>Community and mentorship</li>
          <li>Transparency and measurable outcomes</li>
        </ul>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Meet the Team</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {team.map((member) => (
            <article key={member.id} style={{ border: "1px solid #e6e6e6", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 9999, background: "#ddd" }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{member.name}</div>
                  <div style={{ fontSize: 13, color: "#666" }}>{member.role}</div>
                </div>
              </div>
              <p style={{ marginTop: 10, color: "#444" }}>{member.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: 8 }}>Get In Touch</h2>
        <p style={{ marginTop: 0, color: "#333" }}>Have questions about courses, partnerships, or careers? <a href="/contact">Contact us</a>.</p>
      </section>
    </main>
  );
}