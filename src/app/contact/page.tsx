"use client";

import { SiteNavbar } from "@/components/SiteNavbar";
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
    <>
      <SiteNavbar />
      <main className="mx-auto w-full max-w-screen-md px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl mb-2">Contact Us</h1>
      <p className="text-sm text-gray-600 mb-4">Have a question or feedback? Send us a message and we&apos;ll reply as soon as we can.</p>

      <form onSubmit={handleSubmit} aria-live="polite" className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
            className="w-full max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 box-border"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 box-border"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            placeholder="Tell us what's on your mind"
            className="w-full max-w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 box-border"
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full max-w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>
        </div>

        {status === "success" && <p className="text-sm text-green-600">Message sent — thanks! We will get back to you soon.</p>}
        {status === "error" && <p className="text-sm text-red-600">{error || "Failed to send message."}</p>}
      </form>
    </main>
    </>
  );
}