"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: res.statusText }));
        setError(data?.message || "Request failed");
        setStatus("error");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Network error");
      setStatus("error");
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Contact Us</h1>
      <p style={{ marginTop: 0, marginBottom: 20 }}>Have a question or feedback? Send us a message and we'll reply as soon as we can.</p>

      <form onSubmit={handleSubmit} aria-live="polite" style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid" }}>
          <span style={{ fontSize: 14, marginBottom: 6 }}>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid" }}>
          <span style={{ fontSize: 14, marginBottom: 6 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "grid" }}>
          <span style={{ fontSize: 14, marginBottom: 6 }}>Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
            placeholder="Tell us what's on your mind"
            style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={status === "loading"}
            style={{ padding: "10px 16px", borderRadius: 6, cursor: status === "loading" ? "not-allowed" : "pointer" }}
          >
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
        </div>

        {status === "success" && <p style={{ color: "green" }}>Message sent — thanks! We will get back to you soon.</p>}
        {status === "error" && <p style={{ color: "red" }}>{error || "Failed to send message."}</p>}
      </form>
    </main>
  );
}