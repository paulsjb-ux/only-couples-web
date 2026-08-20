"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  prompt: string;
  result_url: string | null;
  kind: string | null;
  created_at: string;
};

function titleFrom(prompt: string) {
  const raw = (prompt || "").trim();
  if (!raw) return "Untitled scene";
  // "scene-id | Scene Name (wife,husband)"
  const afterPipe = raw.includes("|") ? raw.split("|").slice(1).join("|").trim() : raw;
  const name = afterPipe.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return name || "Untitled scene";
}

function whoFrom(prompt: string) {
  const m = (prompt || "").match(/\(([^)]+)\)\s*$/);
  if (!m) return "";
  return m[1]
    .split(",")
    .map((s) => s.trim().replace(/_/g, " "))
    .filter(Boolean)
    .join(" · ");
}

function whenFrom(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }
    const { data: memberships } = await supabase
      .from("studio_members")
      .select("studio_id")
      .eq("user_id", userData.user.id)
      .limit(1);
    const sid = memberships?.[0]?.studio_id;
    if (!sid) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("generations")
      .select("id,prompt,result_url,kind,created_at")
      .eq("studio_id", sid)
      .not("result_url", "is", null)
      .order("created_at", { ascending: false });
    setItems((data as Item[]) || []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Remove this picture?")) return;
    setBusyId(id);
    const supabase = createClient();
    const { error } = await supabase.from("generations").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      alert(error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Library
        </h1>
        <p className="text-white/90 text-sm">
          Your private collection. Only you and your partner can see these.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] p-12 text-center">
          <div className="text-4xl mb-3 text-[var(--muted)]">✦</div>
          <p className="text-[var(--muted)] text-sm mb-1">No pictures yet</p>
          <Link href="/scenes" className="text-sm underline">
            Browse scenes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => {
            const title = titleFrom(item.prompt);
            const who = whoFrom(item.prompt);
            return (
              <div key={item.id} className="card overflow-hidden p-0">
                <a href={item.result_url || "#"} target="_blank" rel="noreferrer">
                  <div className="aspect-[3/4] bg-[#2A1518]">
                    {item.result_url && (
                      <img
                        src={item.result_url}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </a>
                <div className="p-3">
                  <div
                    className="text-base leading-tight"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {title}
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {[who, item.kind === "video" ? "Video" : "Image", whenFrom(item.created_at)]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <button
                    className="mt-2 text-xs underline text-[var(--muted)]"
                    disabled={busyId === item.id}
                    onClick={() => remove(item.id)}
                  >
                    {busyId === item.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
