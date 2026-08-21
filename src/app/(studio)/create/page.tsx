"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { WOMAN_PRESETS, MAN_PRESETS, type LoverPreset } from "@/lib/presets";

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

const SUGGESTED = [
  { label: "Just us", roles: ["wife", "husband"] },
  { label: "Her + her lover", roles: ["wife", "female_lover"] },
  { label: "Him + his lover", roles: ["husband", "male_lover"] },
  { label: "Two women + him", roles: ["wife", "female_lover", "husband"] },
  { label: "Two men + her", roles: ["wife", "husband", "male_lover"] },
  { label: "Wife only", roles: ["wife"] },
  { label: "Husband only", roles: ["husband"] },
];

function CreateInner() {
  const params = useSearchParams();
  const sceneId = params.get("scene");
  const sceneName =
    params.get("name") ||
    (sceneId ? SCENE_NAMES[sceneId] || sceneId.replace(/-/g, " ") : "Free play");
  const defaultCast = (params.get("cast") || "wife").split(",").filter(Boolean);

  const [allFaces, setAllFaces] = useState<{ role: string; url: string | null; look?: string | null; name?: string | null }[]>([]);
  const [selected, setSelected] = useState<string[]>(defaultCast);
  const [kind, setKind] = useState("image");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [studioId, setStudioId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    path: string | null;
    prompt: string;
    kind: string;
    saved?: boolean;
    id?: string | null;
  } | null>(null);

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
    const next: { role: string; url: string | null }[] = [];
    for (const person of people || []) {
      let url: string | null = null;
      if (person.photo_path) {
        const { data: signed } = await supabase.storage
          .from("people")
          .createSignedUrl(person.photo_path, 60 * 60);
        url = signed?.signedUrl || null;
      }
      next.push({ role: person.role, url, look: person.look, name: person.name });
    }
    setAllFaces(next);
  }

  async function applyPreset(preset: LoverPreset) {
    if (!studioId) {
      alert("Studio not ready");
      return;
    }
    const role = preset.sex === "f" ? "female_lover" : "male_lover";
    const supabase = createClient();
    const existing = allFaces.find((f) => f.role === role);
    const row: Record<string, string | null> = {
      name: preset.name,
      age: preset.age,
      body_shape: preset.body_shape,
      breasts: preset.breasts || null,
      penis: preset.penis || null,
      look: preset.look,
    };
    const { data: people } = await supabase.from("people").select("id,role").eq("studio_id", studioId);
    const found = (people || []).find((p: { role: string }) => p.role === role);

    async function save(payload: Record<string, string | null>) {
      if (found?.id) return supabase.from("people").update(payload).eq("id", found.id);
      return supabase.from("people").insert({ studio_id: studioId, role, ...payload });
    }

    let { error } = await save(row);
    if (error && String(error.message).toLowerCase().includes("look")) {
      const { look: _look, ...without } = row;
      ({ error } = await save(without));
    }
    if (error) {
      alert(error.message);
      return;
    }
    setPicked(preset.id);
    setSelected((prev) => (prev.includes(role) ? prev : [...prev, role]));
    setNote(`Using ${preset.name} as ${role === "female_lover" ? "female lover" : "male lover"}`);
    await load();
    void existing;
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
    setPreview(null);
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
      if (!data.url) {
        setNote("No image came back");
        return;
      }
      setPreview({
        url: data.url,
        path: data.path || null,
        prompt: data.prompt || `${sceneId} | ${sceneName} (${who})`,
        kind: data.kind || kind,
        saved: false,
      });
      setNote("Preview ready. Save to library or delete.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      alert(message);
    } finally {
      setBusy(false);
    }
  }

  async function savePreview() {
    if (!preview || preview.saved) return;
    setBusy(true);
    setNote("Saving to library…");
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: preview.url,
          path: preview.path,
          kind: preview.kind,
          prompt: preview.prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNote(data.error || "Save failed");
        alert(data.error || "Save failed");
        return;
      }
      setPreview({ ...preview, saved: true, id: data.id || null });
      setNote("Saved to library.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deletePreview() {
    if (!preview) return;
    setBusy(true);
    setNote("Deleting…");
    try {
      await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: preview.path, id: preview.id }),
      });
      setPreview(null);
      setNote("Deleted.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
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

        <p className="text-sm font-semibold mt-5 mb-2">Suggested partners</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED.map((s) => {
            const on =
              selected.length === s.roles.length && s.roles.every((r) => selected.includes(r));
            const missing = s.roles.filter(
              (r) => !allFaces.some((f) => f.role === r && f.url)
            );
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setSelected(s.roles)}
                className={
                  on
                    ? "rounded-full px-3 py-1.5 text-xs font-bold bg-[var(--accent)] text-white"
                    : "rounded-full px-3 py-1.5 text-xs font-bold bg-[#F7F0EA] border border-[var(--line)] text-[var(--text)]"
                }
              >
                {s.label}
                {missing.length ? " · add photo" : ""}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Or pick a look below. No extra photo needed for presets.
        </p>

        <p className="text-sm font-semibold mt-5 mb-2">6 women</p>
        <div className="grid grid-cols-3 gap-2">
          {WOMAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={
                picked === p.id
                  ? "rounded-xl overflow-hidden ring-2 ring-[var(--accent)] text-left bg-white"
                  : "rounded-xl overflow-hidden border border-[var(--line)] text-left bg-white"
              }
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-[#3A1F24] to-[#8B4A55]">
                <img
                  src={`/presets/${p.id}.jpg`}
                  alt={p.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs font-semibold leading-tight">{p.name}</div>
                <div className="text-[10px] text-[var(--muted)]">
                  {p.age} · {p.body_shape}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm font-semibold mt-5 mb-2">6 men</p>
        <div className="grid grid-cols-3 gap-2">
          {MAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={
                picked === p.id
                  ? "rounded-xl overflow-hidden ring-2 ring-[var(--accent)] text-left bg-white"
                  : "rounded-xl overflow-hidden border border-[var(--line)] text-left bg-white"
              }
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-[#1C1917] to-[#4A3B32]">
                <img
                  src={`/presets/${p.id}.jpg`}
                  alt={p.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs font-semibold leading-tight">{p.name}</div>
                <div className="text-[10px] text-[var(--muted)]">
                  {p.age} · {p.body_shape}
                </div>
              </div>
            </button>
          ))}
        </div>
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

        {preview && (
          <div className="card p-4 mt-2">
            <p className="text-sm font-semibold mb-3">Preview</p>
            <div className="relative w-full max-w-sm aspect-[3/4] rounded-xl overflow-hidden bg-[#3A1F24] ring-1 ring-black/10">
              <img src={preview.url} alt="Generated preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={savePreview}
                disabled={busy || preview.saved}
              >
                {preview.saved ? "Saved to library" : "Save to library"}
              </button>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-bold bg-white border border-[var(--line)] text-[var(--text)]"
                onClick={deletePreview}
                disabled={busy}
              >
                Delete
              </button>
              {preview.saved && (
                <Link href="/library" className="text-sm underline self-center">
                  Open library
                </Link>
              )}
            </div>
          </div>
        )}
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
