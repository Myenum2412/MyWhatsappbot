"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageForm() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const base =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${base}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ? "Validation failed" : "Send failed");
      }
      setTo("");
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Queue message</h2>
      <input
        className="rounded border px-3 py-2"
        placeholder="Recipient e.g. +15551234567"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        required
      />
      <textarea
        className="rounded border px-3 py-2"
        placeholder="Message body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading ? "Sending..." : "Send via Fastify API"}
      </button>
    </form>
  );
}
