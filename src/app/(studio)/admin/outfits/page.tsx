"use client";

import { useState } from "react";
import Link from "next/link";

type Result = { name: string; path: string; ok: boolean; error?: string };

export default function OutfitAdminPage() {
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState("Ready to copy the 11 bundled outfit images into Supabase Storage.");

  async function uploadAll() {
    setBusy(true); setResults([]); setMessage("Uploading…");
    try {
      const res = await fetch("/api/admin/seed-outfits", { method: "POST" });
      const data = await res.json();
      if (!res.ok && !data.results) throw new Error(data.error || "Upload failed");
      setResults(data.results || []);
      setMessage(`${data.uploaded}/${data.total} outfits uploaded to Supabase.`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed");
    } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <div className="mb-8">
        <Link href="/create" className="text-sm underline underline-offset-2">← Back to Create</Link>
        <h1 className="mt-5 text-3xl font-semibold">Outfit migration</h1>
        <p className="mt-3 text-sm opacity-75">{message}</p>
      </div>
      <button onClick={uploadAll} disabled={busy} className="btn btn-primary w-full disabled:opacity-50">
        {busy ? "Uploading outfits…" : "Upload all outfits to Supabase"}
      </button>
      {results.length > 0 && (
        <div className="mt-8 space-y-2">
          {results.map((r) => (
            <div key={r.path} className="rounded-lg border border-white/10 p-3 text-sm">
              <span>{r.ok ? "✓" : "✕"} {r.name}</span>
              {!r.ok && <div className="mt-1 text-xs opacity-70">{r.error}</div>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
