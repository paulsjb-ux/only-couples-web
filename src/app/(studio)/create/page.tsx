"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const SCENE_NAMES: Record<string, string> = {
  "romance-undress": "Taking her clothes off",
  "romance-naked-together": "Male + Female Undresser",
  "romance-kiss": "Intimate Bed Scene",
  "romance-shower": "After Shower Couple",
  "romance-morning": "Bedroom Smile",
  "erotic-missionary": "Missionary",
  "erotic-cowgirl": "Cowgirl",
  "spicy-ffm": "Two women + him",
  "spicy-mmf": "Two men + her",
  "spicy-dp": "Double penetration",
  "spicy-anal": "Anal",
};

const ALL_ROLES = [
  { key: "wife", label: "Wife" },
  { key: "husband", label: "Husband" },
  { key: "female_lover", label: "Female lover" },
  { key: "male_lover", label: "Male lover" },
];

function CreateInner() {
  const params = useSearchParams();
  const sceneId = params.get("scene");
  const sceneName =
    params.get("name") ||
    (sceneId ? SCENE_NAMES[sceneId] || sceneId.replace(/-/g, " ") : "Free play");
  const defaultCast = (params.get("cast") || "wife").split(",").filter(Boolean);

  const [allFaces, setAllFaces] = useState<{ role: string; url: string | null }[]>([]);
  const [selected, setSelected] = useState<string[]>(defaultCast);
  const [kind, setKind] = useState("image");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    load();
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
    const sid = memberships?.[0]?.studio_id as string | undefined;
    if (!sid) return;
    const { data: people } = await supabase.from("people").select("*").eq("studio_id", sid);
    const next: { role: string; url: string | null }[] = [];
    for (const person of people || []) {
      let url: string | null = null;
      if (person.photo_path) {
        const { data: signed } = await supabase.storage
          .from("people")
          .createSignedUrl(person.photo_path, 60 * 60);
        url = signed?.signedUrl || null;
      }
      next.push({ role: person.role, url });
    }
    setAllFaces(next);
  }

  function toggleRole(role: string) {
    setSelected((prev) => {
      if (prev.includes(role)) {
        if (prev.length === 1) return prev;
        return prev.filter((r) => r !== role);
      }
      return [...prev, role];
    });
  }

  async function generate() {
    if (selected.length === 0) {
      alert("Choose at least one person");
      return;
    }
    setBusy(true);
    setNote("Making the image. This can take a minute…");
    const who = selected.join(",");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneName, sceneId, who, kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNote(data.error || "Generation failed");
        alert(data.error || "Generation failed");
        return;
      }
      setNote("Done. Open Library or Scenes to see it.");
      if (data.url) window.open(data.url, "_blank");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      alert(message);
    } finally {
      setBusy(false);
    }
  }

  const shown = allFaces.filter((f) => selected.includes(f.role));

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {sceneName}
        </h1>
        <p className="text-white/90 text-sm">Choose who is in this scene.</p>
      </div>

      <div className="card p-4 mb-6 max-w-2xl">
        <p className="text-sm font-semibold mb-3">Cast</p>
        <div className="flex flex-wrap gap-2">
          {ALL_ROLES.map((r) => {
            const on = selected.includes(r.key);
            const hasFace = allFaces.some((f) => f.role === r.key && f.url);
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => toggleRole(r.key)}
                className={
                  on
                    ? "rounded-full px-4 py-2 text-sm font-bold bg-[var(--accent)] text-white"
                    : "rounded-full px-4 py-2 text-sm font-bold bg-white border border-[var(--line)] text-[var(--text)]"
                }
              >
                {r.label}
                {!hasFace ? " · no photo" : ""}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--muted)] mt-3">
          Tap to add or remove. You need a photo on People for each person you select.
        </p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {shown.length === 0 && (
          <Link href="/people" className="text-sm underline">
            Add faces on People first
          </Link>
        )}
        {shown.map((f) => (
          <div key={f.role} className="text-center">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#3A1F24]">
              {f.url && (
                <img src={f.url} alt={f.role} className="w-full h-full object-cover object-top" />
              )}
            </div>
            <div className="text-xs mt-1">
              {ALL_ROLES.find((r) => r.key === f.role)?.label || f.role}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Media</label>
          <select
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        <button className="btn btn-primary w-full sm:w-auto" onClick={generate} disabled={busy}>
          {busy ? "Making…" : "Use this scene"}
        </button>
        {note && <p className="text-sm text-[var(--muted)]">{note}</p>}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <CreateInner />
    </Suspense>
  );
}
