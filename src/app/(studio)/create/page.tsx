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
  "erotic-missionary": "Missionary",
  "erotic-cowgirl": "Cowgirl",
  "spicy-ffm": "Two women + him",
  "spicy-mmf": "Two men + her",
  "spicy-dp": "Double penetration",
  "spicy-anal": "Anal",
};

const LABELS: Record<string, string> = {
  wife: "Wife",
  husband: "Husband",
  female_lover: "Female lover",
  male_lover: "Male lover",
};

function CreateInner() {
  const params = useSearchParams();
  const sceneId = params.get("scene");
  const sceneName = sceneId ? SCENE_NAMES[sceneId] || sceneId.replace(/-/g, " ") : "Free play";
  const wanted = (params.get("cast") || "wife").split(",").filter(Boolean);

  const [studioId, setStudioId] = useState<string | null>(null);
  const [faces, setFaces] = useState<{ role: string; url: string | null }[]>([]);
  const [who, setWho] = useState(wanted.join(","));
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
    setStudioId(sid);
    const { data: people } = await supabase.from("people").select("*").eq("studio_id", sid);
    const next = [];
    for (const person of people || []) {
      if (wanted.length && !wanted.includes(person.role)) continue;
      let url: string | null = null;
      if (person.photo_path) {
        const { data: signed } = await supabase.storage
          .from("people")
          .createSignedUrl(person.photo_path, 60 * 60);
        url = signed?.signedUrl || null;
      }
      next.push({ role: person.role, url });
    }
    setFaces(next);
  }

  async function generate() {
    setBusy(true);
    setNote("Making the image. This can take a minute…");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneName, who, kind }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNote(data.error || "Generation failed");
        alert(data.error || "Generation failed");
        return;
      }
      setNote("Done. Open Library to see it.");
      if (data.url) window.open(data.url, "_blank");
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {sceneName}
        </h1>
        <p className="text-white/90 text-sm">This scene will use the faces below.</p>
      </div>

      <div className="flex gap-3 mb-6">
        {faces.length === 0 && (
          <Link href="/people" className="text-sm underline">
            Add the faces this scene needs
          </Link>
        )}
        {faces.map((f) => (
          <div key={f.role} className="text-center">
            <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#3A1F24]">
              {f.url && (
                <img src={f.url} alt={f.role} className="w-full h-full object-cover object-top" />
              )}
            </div>
            <div className="text-xs mt-1">{LABELS[f.role] || f.role}</div>
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