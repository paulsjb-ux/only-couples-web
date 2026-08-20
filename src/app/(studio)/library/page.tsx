"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  kind: string;
  prompt: string | null;
  result_url: string | null;
  created_at: string;
};

export default function LibraryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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
      .select("*")
      .eq("studio_id", sid)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setItems((list) => list.filter((item) => item.id !== id));
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden">
              {item.result_url ? (
                <a href={item.result_url} target="_blank">
                  <img
                    src={item.result_url}
                    alt={item.prompt || "Scene"}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </a>
              ) : (
                <div className="aspect-[3/4] bg-[#3A1F24] flex items-center justify-center text-white/30">
                  ✦
                </div>
              )}
              <div className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--muted)] mb-1">
                    {item.kind}
                  </div>
                  <div className="font-medium">{item.prompt || "Untitled scene"}</div>
                </div>
                <button
                  className="text-xs text-[var(--muted)] underline"
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