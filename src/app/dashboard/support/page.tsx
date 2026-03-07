"use client";

import { useState } from "react";

export default function SupportPage() {
  const [form, setForm] = useState({ subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setLoading(true);
    setSent(false);
    try {
      // Optional: POST to an API that sends email or stores ticket
      await new Promise((r) => setTimeout(r, 500));
      setSent(true);
      setForm({ subject: "", message: "" });
    } catch {
      // fallback: could show error
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Support
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Get help or reach out to us.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-gray-600">
          You can also email us directly at{" "}
          <a
            href="mailto:support@earnwale.com"
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            support@earnwale.com
          </a>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm((f) => ({ ...f, subject: e.target.value }))
              }
              className={inputClass}
              placeholder="Brief subject"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={4}
              className={inputClass}
              placeholder="Your message"
            />
          </div>
          {sent && (
            <p className="text-sm text-emerald-600">
              Message sent. We&apos;ll get back to you soon.
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-70"
          >
            {loading ? "Sending…" : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
