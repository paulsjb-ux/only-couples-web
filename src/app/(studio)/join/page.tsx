"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Partner invite — MVP placeholder.
 * Wire to real invite tokens + /api/studio when ready.
 */
export default function JoinPage() {
  const [code, setCode] = useState("");
  const [note, setNote] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setNote("Enter the invite code from your partner.");
      return;
    }
    setNote(
      "Invite codes are not connected yet. Ask your partner to share the studio from Account when that ships — or both use the same login for now."
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-10">
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gold, #c4a574)" }}>
        Partner
      </p>
      <h1
        className="text-3xl mb-2"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        Join a studio
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--cream-muted, #c9bdb0)" }}>
        Enter the invite code your partner sent. You&apos;ll share the same private
        album.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: "var(--cream-muted, #c9bdb0)" }}>
            Invite code
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-xl border px-4 py-3.5"
            style={{
              borderColor: "rgba(243,235,224,0.15)",
              background: "#1a1816",
              color: "#f3ebe0",
            }}
            placeholder="e.g. TOR-XXXX"
            autoComplete="off"
          />
        </div>
        {note && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--cream-muted, #c9bdb0)" }}>
            {note}
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full" style={{ minHeight: "3rem" }}>
          Join studio
        </button>
      </form>

      <p className="mt-8 text-center text-sm">
        <Link href="/home" className="underline underline-offset-2">
          Back to home
        </Link>
      </p>
    </div>
  );
}
