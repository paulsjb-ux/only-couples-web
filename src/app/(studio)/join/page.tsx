"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Partner invite — join via studio UUID from Account.
 */
export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    setError(null);
    if (!code.trim()) {
      setError("Enter the invite code from your partner.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/studio/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not join");
        setLoading(false);
        return;
      }
      setNote(data.message || "Joined. Opening home…");
      router.push("/home");
      router.refresh();
    } catch {
      setError("Network error — try again");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="studio-hero">
        <p
          className="text-xs uppercase tracking-[0.2em] mb-2"
          style={{ color: "var(--accent)" }}
        >
          Partner
        </p>
        <h1
          className="text-2xl md:text-3xl font-medium mb-2"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "var(--text)",
          }}
        >
          Join a studio
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Enter the invite code from Account on your partner&apos;s device. You
          will share the same private album.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: "var(--text)" }}
          >
            Invite code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm"
            placeholder="Studio ID from partner Account"
            autoComplete="off"
          />
        </div>
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}
        {note && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {note}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-studio-primary w-full disabled:opacity-60"
        >
          {loading ? "Joining…" : "Join studio"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm" style={{ color: "var(--muted)" }}>
        <Link href="/home" className="underline underline-offset-2">
          Back to home
        </Link>
        {" · "}
        <Link href="/account" className="underline underline-offset-2">
          Your invite code
        </Link>
      </p>
    </div>
  );
}
