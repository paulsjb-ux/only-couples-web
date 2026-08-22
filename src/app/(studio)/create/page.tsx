"use client";

import { useEffect, useRef, useState, Suspense } from "react";
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

// Opposite-sex lovers by default: his lover = woman, her lover = man
const SUGGESTED = [
  { label: "Just us", roles: ["wife", "husband"] },
  { label: "Him + his lover", roles: ["husband", "female_lover"] },
  { label: "Her + her lover", roles: ["wife", "male_lover"] },
  { label: "Two women + him", roles: ["wife", "female_lover", "husband"] },
  { label: "Two men + her", roles: ["wife", "husband", "male_lover"] },
  { label: "Wife only", roles: ["wife"] },
  { label: "Husband only", roles: ["husband"] },
];

type FaceRow = {
  role: string;
  url: string | null;
  look?: string | null;
  name?: string | null;
};

type PreviewItem = {
  url: string;
  path: string | null;
  prompt: string;
  kind: string;
  saved?: boolean;
  id?: string | null;
};

function CreateInner() {
  const params = useSearchParams();
  const sceneId = params.get("scene");
  const sceneName =
    params.get("name") ||
    (sceneId ? SCENE_NAMES[sceneId] || sceneId.replace(/-/g, " ") : "Free play");
  const defaultCast = (params.get("cast") || "wife").split(",").filter(Boolean);

  const [allFaces, setAllFaces] = useState<FaceRow[]>([]);
  const [selected, setSelected] = useState<string[]>(defaultCast);
  const [kind, setKind] = useState("image");
  const [versions, setVersions] = useState(1);
  const [outfitPath, setOutfitPath] = useState<string | null>(null);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [outfitWearer, setOutfitWearer] = useState("wife");
  const outfitFileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [studioId, setStudioId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [uploadRole, setUploadRole] = useState("female_lover");
  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (previews.length > 0 && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previews]);

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
    const next: FaceRow[] = [];
    for (const person of people || []) {
      let url: string | null = null;
      if (person.photo_path) {
        const { data: signed } = await supabase.storage
          .from("people")
          .createSignedUrl(person.photo_path, 60 * 60);
        url = signed?.signedUrl || null;
      }
      next.push({
        role: person.role,
        url,
        look: person.look,
        name: person.name,
      });
    }
    setAllFaces(next);
  }

  async function upsertPerson(
    role: string,
    payload: Record<string, string | null>,
    photoPath?: string
  ) {
    const supabase = createClient();
    const { data: people } = await supabase
      .from("people")
      .select("id,role")
      .eq("studio_id", studioId!);
    const found = (people || []).find((p: { role: string }) => p.role === role);
    const row = {
      ...payload,
      ...(photoPath ? { photo_path: photoPath } : {}),
    };
    if (found?.id) {
      return supabase.from("people").update(row).eq("id", found.id);
    }
    return supabase.from("people").insert({ studio_id: studioId, role, ...row });
  }

  /** Apply preset: save body/look AND upload the preset JPG so generate gets a face ref */
  async function applyPreset(preset: LoverPreset) {
    if (!studioId) {
      alert("Studio not ready");
      return;
    }
    const role = preset.sex === "f" ? "female_lover" : "male_lover";
    setBusy(true);
    setNote(`Loading ${preset.name}…`);
    try {
      const res = await fetch(`/presets/${preset.id}.jpg`);
      if (!res.ok) throw new Error("Preset image missing — put JPGs in public/presets/");
      const blob = await res.blob();
      const path = `${studioId}/${role}-preset-${preset.id}.jpg`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("people")
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw new Error(upErr.message);

      const row: Record<string, string | null> = {
        name: preset.name,
        age: preset.age,
        body_shape: preset.body_shape,
        breasts: preset.breasts || null,
        penis: preset.penis || null,
        look: preset.look,
      };
      let { error } = await upsertPerson(role, row, path);
      if (error && String(error.message).toLowerCase().includes("look")) {
        const { look: _l, ...without } = row;
        ({ error } = await upsertPerson(role, without, path));
      }
      if (error) throw new Error(error.message);

      setPicked(preset.id);
      setSelected((prev) => (prev.includes(role) ? prev : [...prev, role]));
      setNote(`Using ${preset.name} as ${role === "female_lover" ? "female lover" : "male lover"}`);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Could not apply preset");
      setNote("");
    } finally {
      setBusy(false);
    }
  }

  /** Upload a photo from phone/Mac into a cast role */
  async function uploadCastPhoto(file: File, role: string) {
    if (!studioId) {
      alert("Studio not ready");
      return;
    }
    setBusy(true);
    setNote("Uploading photo…");
    try {
      const path = `${studioId}/${role}-${Date.now()}.jpg`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from("people")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
      if (upErr) throw new Error(upErr.message);

      const { error } = await upsertPerson(
        role,
        { name: file.name.replace(/\.[^.]+$/, "") || role },
        path
      );
      if (error) throw new Error(error.message);

      setSelected((prev) => (prev.includes(role) ? prev : [...prev, role]));
      setNote(`Photo set for ${ALL_ROLES.find((r) => r.key === role)?.label || role}`);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload failed");
      setNote("");
    } finally {
      setBusy(false);
    }
  }


  async function uploadOutfit(file: File) {
    if (!studioId) {
      alert("Studio not ready");
      return;
    }
    setBusy(true);
    setNote("Uploading outfit…");
    try {
      const path = `${studioId}/outfit/${Date.now()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("library")
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
      if (error) throw new Error(error.message);
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(path, 60 * 60);
      setOutfitPath(path);
      setOutfitPreview(signed?.signedUrl || null);
      setNote("Outfit ready — choose who wears it, then generate.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Outfit upload failed");
      setNote("");
    } finally {
      setBusy(false);
    }
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
    const missing = selected.filter((r) => !allFaces.some((f) => f.role === r && f.url));
    if (missing.length) {
      alert(
        `Add a photo for: ${missing
          .map((r) => ALL_ROLES.find((x) => x.key === r)?.label || r)
          .join(", ")}`
      );
      return;
    }
    if (outfitPath && outfitWearer && !selected.includes(outfitWearer)) {
      setSelected((prev) => [...prev, outfitWearer]);
    }
    setBusy(true);
    setPreviews([]);
    const n = kind === "image" ? versions : 1;
    setNote(
      n > 1
        ? `Making ${n} versions. This can take a couple of minutes…`
        : "Making the image. This can take a minute…"
    );
    const who = selected.join(",");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneName: outfitPath && !sceneId ? (sceneName === "Free play" ? "Outfit try-on" : sceneName) : sceneName,
          sceneId: outfitPath && !sceneId ? "outfit-try-on" : sceneId,
          who: outfitPath && outfitWearer && !selected.includes(outfitWearer)
            ? [...selected, outfitWearer].join(",")
            : who,
          kind,
          versions: n,
          outfitPath,
          outfitWearer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNote(data.error || "Generation failed");
        alert(data.error || "Generation failed");
        return;
      }
      const rawItems =
        Array.isArray(data.items) && data.items.length
          ? data.items
          : data.url
            ? [{ url: data.url, path: data.path || null, id: data.id || null }]
            : [];
      if (!rawItems.length) {
        setNote("No image came back");
        return;
      }
      const promptBase = data.prompt || `${sceneId} | ${sceneName} (${who})`;
      setPreviews(
        rawItems.map((it: { url: string; path?: string | null; id?: string | null }, i: number) => ({
          url: it.url,
          path: it.path || null,
          prompt: rawItems.length > 1 ? `${promptBase} · v${i + 1}` : promptBase,
          kind: data.kind || kind,
          saved: false,
          id: it.id || null,
        }))
      );
      setNote(
        `${rawItems.length} preview${rawItems.length > 1 ? "s" : ""} ready. Keep to add to your private album, or Discard.`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  async function saveOne(index: number) {
    const item = previews[index];
    if (!item || item.saved) return;
    setBusy(true);
    setNote("Keeping in your album…");
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: item.url,
          path: item.path,
          kind: item.kind,
          prompt: item.prompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNote(data.error || "Save failed");
        alert(data.error || "Save failed");
        return;
      }
      setPreviews((prev) =>
        prev.map((p, i) => (i === index ? { ...p, saved: true, id: data.id || null } : p))
      );
      setNote("Kept in your private album.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function deleteOne(index: number) {
    const item = previews[index];
    if (!item) return;
    setBusy(true);
    setNote("Deleting…");
    try {
      await fetch("/api/library", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: item.path, id: item.id }),
      });
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      setNote("Deleted.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  /** Download for Photos/Files — works on Mac; on iPhone opens share/save flow */
  async function downloadOne(index: number) {
    const item = previews[index];
    if (!item?.url) return;
    try {
      const res = await fetch(item.url);
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `the-other-room-${Date.now()}-v${index + 1}.jpg`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      window.open(item.url, "_blank");
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
        <p className="text-white/90 text-sm">Choose who is in this scene, then generate.</p>
      </div>

      {/* Results first after generate — save controls at top of this block */}
      <div ref={previewRef}>
        {previews.length > 0 && (
          <div className="card p-4 mb-8 max-w-2xl border-2 border-[var(--accent)]">
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[var(--text)]">
                {previews.length > 1 ? `${previews.length} versions` : "Your image"}
              </p>
              <div className="flex gap-3 text-sm">
                {previews.some((p) => p.saved) && (
                  <Link href="/library" className="underline text-[var(--text)]">
                    Open library
                  </Link>
                )}
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Preview only — not in your album until you Keep. Discard removes it. Download is optional.
            </p>
            <div
              className={`grid gap-4 ${
                previews.length === 1 ? "grid-cols-1 max-w-sm" : "grid-cols-2"
              }`}
            >
              {previews.map((item, index) => (
                <div key={`${item.url}-${index}`} className="rounded-xl border border-[var(--line)] p-3 bg-white">
                  <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#3A1F24] ring-1 ring-black/10">
                    <img
                      src={item.url}
                      alt={`Version ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2">Version {index + 1}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-primary text-xs px-3 py-1.5"
                      onClick={() => saveOne(index)}
                      disabled={busy || item.saved}
                    >
                      {item.saved ? "Kept" : "Keep"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-xs font-bold bg-white border border-[var(--line)] text-[var(--text)]"
                      onClick={() => downloadOne(index)}
                      disabled={busy}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-xs font-bold bg-white border border-[var(--line)] text-[var(--text)]"
                      onClick={() => deleteOne(index)}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create controls ABOVE the 12 presets */}
      <div className="card p-4 mb-6 max-w-2xl space-y-5">
        <p className="text-sm font-semibold text-[var(--text)]">Create</p>

        <div className="flex flex-wrap gap-2">
          {shown.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Select cast below, or upload a photo.</p>
          )}
          {shown.map((f) => (
            <div key={f.role} className="text-center">
              <div className="w-14 h-[72px] rounded-xl overflow-hidden bg-[#3A1F24] ring-1 ring-black/10">
                {f.url && (
                  <img src={f.url} alt={f.role} className="w-full h-full object-cover object-top" />
                )}
              </div>
              <div className="text-[10px] mt-1 text-[var(--text)]">
                {ALL_ROLES.find((r) => r.key === f.role)?.label || f.role}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5 text-[var(--text)]">Media</label>
          <select
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--text)]"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        
        <div className="border-t border-[var(--line)] pt-4">
          <p className="text-sm font-semibold mb-1.5 text-[var(--text)]">Add me in this outfit</p>
          <p className="text-xs text-[var(--muted)] mb-2">
            Upload a dress, suit, lingerie, or any outfit photo. We put the chosen person into that exact look.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              className="rounded-full px-4 py-2 text-sm font-bold bg-white border border-[var(--line)] text-[var(--text)]"
              onClick={() => outfitFileRef.current?.click()}
              disabled={busy}
            >
              Upload outfit
            </button>
            <input
              ref={outfitFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadOutfit(file);
                e.target.value = "";
              }}
            />
            {outfitPath && (
              <button
                type="button"
                className="text-xs underline text-[var(--muted)]"
                onClick={() => {
                  setOutfitPath(null);
                  setOutfitPreview(null);
                }}
              >
                Clear outfit
              </button>
            )}
          </div>
          {outfitPreview && (
            <div className="flex gap-3 items-start mb-2">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-[#3A1F24] ring-1 ring-black/10 shrink-0">
                <img src={outfitPreview} alt="Outfit" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-[var(--text)]">Who wears it</label>
                <select
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--text)]"
                  value={outfitWearer}
                  onChange={(e) => setOutfitWearer(e.target.value)}
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  Face photo required for that person (People or cast).
                </p>
              </div>
            </div>
          )}
        </div>

        {kind === "image" && (
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-[var(--text)]">Versions</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVersions(n)}
                  className={`rounded-full px-4 py-2 text-sm font-bold border ${
                    versions === n
                      ? "bg-[var(--accent)] text-white border-transparent"
                      : "bg-white border-[var(--line)] text-[var(--text)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              1 base · 2 wider frame · 3 tighter crop · 4 moodier light.
            </p>
          </div>
        )}

        <button className="btn btn-primary w-full sm:w-auto" onClick={generate} disabled={busy}>
          {busy
            ? "Making…"
            : kind === "image" && versions > 1
              ? `Make ${versions} versions`
              : "Use this scene"}
        </button>
        {note && <p className="text-sm text-[var(--muted)]">{note}</p>}
      </div>

      {/* Cast */}
      <div className="card p-4 mb-6 max-w-2xl">
        <p className="text-sm font-semibold mb-3 text-[var(--text)]">Cast</p>
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
          Tap to add or remove. Each selected role needs a photo (preset, People, or upload).
        </p>

        <p className="text-sm font-semibold mt-5 mb-2 text-[var(--text)]">Suggested partners</p>
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

        {/* Upload from phone / Mac */}
        <p className="text-sm font-semibold mt-5 mb-2 text-[var(--text)]">Upload a face</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--text)]"
            value={uploadRole}
            onChange={(e) => setUploadRole(e.target.value)}
          >
            {ALL_ROLES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-bold bg-white border border-[var(--line)] text-[var(--text)]"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            Choose photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadCastPhoto(file, uploadRole);
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-xs text-[var(--muted)] mt-1.5">
          From your phone camera roll or Mac. Becomes that role’s face lock.
        </p>

        <p className="text-sm font-semibold mt-5 mb-2 text-[var(--text)]">6 women</p>
        <div className="grid grid-cols-3 gap-2">
          {WOMAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={busy}
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
                <div className="text-xs font-semibold leading-tight text-[var(--text)]">{p.name}</div>
                <div className="text-[10px] text-[var(--muted)]">
                  {p.age} · {p.body_shape}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm font-semibold mt-5 mb-2 text-[var(--text)]">6 men</p>
        <div className="grid grid-cols-3 gap-2">
          {MAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={busy}
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
                <div className="text-xs font-semibold leading-tight text-[var(--text)]">{p.name}</div>
                <div className="text-[10px] text-[var(--muted)]">
                  {p.age} · {p.body_shape}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm max-w-2xl">
        <Link href="/people" className="underline text-[var(--text)]">
          Manage faces on People
        </Link>
      </p>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<p className="text-[var(--text)]">Loading…</p>}>
      <CreateInner />
    </Suspense>
  );
}
