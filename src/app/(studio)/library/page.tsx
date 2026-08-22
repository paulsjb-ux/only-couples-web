"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Gen = {
  id: string;
  result_url: string | null;
  prompt: string | null;
  kind: string | null;
  created_at?: string;
};

export default function LibraryPage() {
  const [items, setItems] = useState<Gen[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: memberships } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", userData.user.id)
      .limit(1);
    const sid = memberships?.[0]?.studio_id;
    if (!sid) return;
    const { data } = await supabase
      .from("generations")
      .select("id, result_url, prompt, kind, created_at")
      .eq("studio_id", sid)
      .order("created_at", { ascending: false })
      .limit(60);
    setItems((data as Gen[]) || []);
  }

  /** Save image to device — Mac Downloads / iPhone Photos via share sheet */
  async function downloadToDevice(url: string, id: string) {
    setBusy(true);
    setNote("Preparing download…");
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `the-other-room-${id.slice(0, 8)}.jpg`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
      setNote("Saved. On iPhone: use the share sheet → Save Image. On Mac: check Downloads.");
    } catch {
      window.open(url, "_blank");
      setNote("Opened image — long-press or right-click to save.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1 text-white"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Library
        </h1>
        <p className="text-white/90 text-sm">Private album. Nothing is public. We don&apos;t train on your photos.</p>
      </div>

      {note && <p className="text-sm text-[var(--muted)] mb-4">{note}</p>}

      {items.length === 0 ? (
        <div className="card p-6 max-w-lg">
          <p className="text-[var(--text)] mb-2">Your private album is empty.</p>
          <p className="text-sm text-[var(--muted)] mb-3">
            Start with a soft scene. Previews are temporary until you Keep them.
          </p>
          <Link href="/scenes" className="underline text-sm text-[var(--text)]">
            Start with a soft scene
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card p-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#3A1F24]">
                {item.result_url ? (
                  <img
                    src={item.result_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-2 line-clamp-2">
                {item.prompt || "Scene"}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.result_url && (
                  <button
                    type="button"
                    disabled={busy}
                    className="btn btn-primary text-xs px-3 py-1.5"
                    onClick={() => downloadToDevice(item.result_url!, item.id)}
                  >
                    Download
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-full px-3 py-1.5 text-xs font-bold bg-white border border-[var(--line)] text-[var(--text)]"
                  onClick={() => remove(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
