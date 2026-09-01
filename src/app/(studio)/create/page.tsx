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

type GeneratedItem = {
  url?: string;
  download_url?: string;
  image_url?: string;
  path?: string | null;
  id?: string | null;
};

type LibraryResponse = {
  error?: string;
  message?: string;
  id?: string | null;
  path?: string | null;
  url?: string;
};

type PreviewItem = {
  url: string;
  path: string | null;
  prompt: string;
  kind: string;
  saved?: boolean;
  id?: string | null;
};

type OutfitPreset = {
  id: string;
  name: string;
  category: "soft" | "playful" | "after-dark";
  src: string;
  storagePath: string;
};

type SupabaseOutfitRow = {
  id: string;
  slug: string;
  name: string;
  category: "soft" | "playful" | "afterdark";
  storage_path: string;
  sort_order: number;
};

const OUTFIT_CATEGORY_LABELS: Record<OutfitPreset["category"], string> = {
  soft: "Soft",
  playful: "Playful",
  "after-dark": "After dark",
};

const OUTFIT_CATEGORY_ORDER: OutfitPreset["category"][] = [
  "soft",
  "playful",
  "after-dark",
];

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
    const [outfitPresets, setOutfitPresets] = useState<OutfitPreset[]>((["soft:black-lace-slip-dress","soft:navy-lace-robe","playful:floral-lace-teddy","playful:high-neck-lace-garter-set","playful:lace-corset-garter-set","playful:plunge-lace-bodysuit","playful:strappy-lace-bodysuit","after-dark:corset-garter-stockings-set","after-dark:plunge-butterfly-lace-teddy","after-dark:sheer-lace-cutout-bodysuit","after-dark:strappy-floral-lace-bodysuit"] as const).map((entry) => { const [category, id] = entry.split(":") as [OutfitPreset["category"], string]; const folder = category === "after-dark" ? "afterdark" : category; return { id, name: id.replace(/-/g, " "), category, src: "/outfits/" + folder + "/" + id + ".jpg", storagePath: folder + "/" + id + ".jpg" }; }));
  const [pickedOutfitPreset, setPickedOutfitPreset] = useState<string | null>(null);
  const outfitFileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const generateInFlightRef = useRef(false);
  const [note, setNote] = useState("");
  const [studioId, setStudioId] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [uploadRole, setUploadRole] = useState("female_lover");
  const previewRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    load();
    void loadOutfitPresets();
  }, []);

  useEffect(() => {
    if (previews.length > 0 && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [previews]);

  async function loadOutfitPresets() {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("outfits")
        .select("id,slug,name,category,storage_path,sort_order")
        .eq("active", true)
        .order("category")
        .order("sort_order");
      if (error) throw error;

      const rows = (data || []) as SupabaseOutfitRow[];

      // One-time migration: copy bundled seed images into Supabase Storage.
      // Safe to run repeatedly; existing objects are skipped.
      const byCategory = new Map<string, Set<string>>();
      for (const category of ["soft", "playful", "afterdark"] as const) {
        const { data: objects } = await supabase.storage.from("outfits").list(category, { limit: 100 });
        byCategory.set(category, new Set((objects || []).map((o) => o.name)));
      }

      for (const row of rows) {
        const filename = row.storage_path.split("/").pop() || `${row.slug}.jpg`;
        const existing = byCategory.get(row.category);
        if (existing?.has(filename)) continue;
        const seedSrc = `/outfits/${row.category}/${row.slug}.jpg`;
        try {
          const seed = await fetch(seedSrc, { cache: "no-store" });
          if (!seed.ok) continue;
          const blob = await seed.blob();
          const { error: uploadError } = await supabase.storage
            .from("outfits")
            .upload(row.storage_path, blob, {
              contentType: blob.type || "image/jpeg",
              upsert: false,
            });
          if (!uploadError) existing?.add(filename);
        } catch {
          // If a bundled seed is unavailable, keep loading any already-migrated outfits.
        }
      }

      const presets: OutfitPreset[] = rows.map((row) => {
        const { data: publicUrl } = supabase.storage.from("outfits").getPublicUrl(row.storage_path);
        return {
          id: row.slug,
          name: row.name,
          category: row.category === "afterdark" ? "after-dark" : row.category,
          src: publicUrl.publicUrl,
          storagePath: row.storage_path,
        };
      });
            if (presets.length > 0) setOutfitPresets(presets);
    } catch {
      // Manual upload remains available if Supabase outfit loading is unavailable.
    }
  }

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
      setNote("Studio not ready");
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
        const without = { ...row };
        delete without.look;
        ({ error } = await upsertPerson(role, without, path));
      }
      if (error) throw new Error(error.message);

      setPicked(preset.id);
      setSelected((prev) => (prev.includes(role) ? prev : [...prev, role]));
      setNote(`Using ${preset.name} as ${role === "female_lover" ? "female lover" : "male lover"}`);
      await load();
    } catch (err: unknown) {
      setNote(err instanceof Error ? err.message : "Could not apply preset");
    } finally {
      setBusy(false);
    }
  }

  /** Upload a photo from phone/Mac into a cast role */
  async function uploadCastPhoto(file: File, role: string) {
    if (!studioId) {
      setNote("Studio not ready");
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
      setNote(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }


  async function applyOutfitPreset(preset: OutfitPreset) {
    if (!studioId) {
      setNote("Studio not ready");
      return;
    }
    setBusy(true);
    setNote(`Loading ${preset.name}…`);
    try {
      const res = await fetch(preset.src);
      if (!res.ok) throw new Error("Outfit image could not be loaded");
      const blob = await res.blob();
      const contentType = blob.type || "image/jpeg";
      const extension =
        contentType.includes("png") ? "png" :
        contentType.includes("webp") ? "webp" :
        "jpg";
      const path = `${studioId}/outfit/preset-${preset.id}-${Date.now()}.${extension}`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("library")
        .upload(path, blob, { contentType, upsert: true });
      if (error) throw new Error(error.message);
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(path, 60 * 60);
      setOutfitPath(path);
      setOutfitPreview(signed?.signedUrl || preset.src);
      setPickedOutfitPreset(preset.id);
      setNote(`${preset.name} ready — choose who wears it, then generate.`);
    } catch (err: unknown) {
      setNote(err instanceof Error ? err.message : "Could not select outfit");
    } finally {
      setBusy(false);
    }
  }

  async function uploadOutfit(file: File) {
    if (!studioId) {
      setNote("Studio not ready");
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
      setPickedOutfitPreset(null);
      setNote("Outfit ready — choose who wears it, then generate.");
    } catch (err: unknown) {
      setNote(err instanceof Error ? err.message : "Outfit upload failed");
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

  async function recoverLatestPreview(startedAt: string): Promise<boolean> {
    if (!studioId) return false;
    setNote("Image completed — recovering it safely…");
    const supabase = createClient();

    for (let attempt = 0; attempt < 15; attempt++) {
      const { data: rows } = await supabase
        .from("generations")
        .select("id,result_url,storage_path,kind,prompt,status,created_at")
        .eq("studio_id", studioId)
        .eq("status", "preview")
        .gte("created_at", startedAt)
        .order("created_at", { ascending: false })
        .limit(4);

      if (rows?.length) {
        const recovered: PreviewItem[] = [];
        for (const row of rows) {
          let url = row.result_url as string | null;
          if (row.storage_path) {
            const { data: signed } = await supabase.storage
              .from("library")
              .createSignedUrl(row.storage_path, 60 * 60 * 24);
            if (signed?.signedUrl) url = signed.signedUrl;
          }
          if (url) {
            recovered.push({
              url,
              path: row.storage_path || null,
              prompt: row.prompt || "",
              kind: row.kind || "image",
              saved: false,
              id: row.id || null,
            });
          }
        }
        if (recovered.length) {
          setPreviews(recovered.reverse());
          setNote(
            recovered.length === 1
              ? "1 ready — recovered safely. Tap Keep to save it."
              : recovered.length + " ready — recovered safely. Keep the ones you want."
          );
          return true;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return false;
  }

  async function generate() {
    // Synchronous guard: one user action can create only one /api/generate request.
    // Do not rely on `busy` alone because React state updates on the next render.
    if (generateInFlightRef.current) return;
    generateInFlightRef.current = true;
    if (selected.length === 0) {
      setNote("Choose at least one person");
      generateInFlightRef.current = false;
      return;
    }
    const missing = selected.filter((r) => !allFaces.some((f) => f.role === r && f.url));
    if (missing.length) {
      setNote(
        `Add a photo for: ${missing
          .map((r) => ALL_ROLES.find((x) => x.key === r)?.label || r)
          .join(", ")}`
      );
      generateInFlightRef.current = false;
      return;
    }
    // Outfit scenes need an uploaded garment
    const needsOutfit =
      sceneId === "outfit-try-on" ||
      sceneId === "who-wore-it-best" ||
      (sceneName || "").toLowerCase().includes("outfit") ||
      (sceneName || "").toLowerCase().includes("who wore");
    if (needsOutfit && !outfitPath) {
      setNote("Upload an outfit photo first — dress, suit, lingerie, or any look.");
      generateInFlightRef.current = false;
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
    const generationStartedAt = new Date(Date.now() - 5000).toISOString();
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || data.message || `Generation failed (${res.status})`;
        setNote(msg);
        return;
      }
      const rawItems: GeneratedItem[] =
        Array.isArray(data.items) && data.items.length
          ? data.items
          : data.url
            ? [{ url: data.url, path: data.path || null, id: data.id || null }]
            : [];
      const promptBase =
        data.prompt || `${sceneId || "scene"} | ${sceneName} (${who})`;
      const built = rawItems
        .map((it, i) => {
          const u =
            it?.url ||
            it?.download_url ||
            it?.image_url;
          if (!u) return null;
          return {
            url: String(u),
            path: it.path || data.path || null,
            prompt:
              rawItems.length > 1 ? `${promptBase} · v${i + 1}` : promptBase,
            kind: data.kind || kind,
            saved: false,
            id: it.id || null,
          };
        })
        .filter(Boolean) as {
        url: string;
        path: string | null;
        prompt: string;
        kind: string;
        saved: boolean;
        id: string | null;
      }[];
      if (!built.length) {
        const recovered = await recoverLatestPreview(generationStartedAt);
        if (recovered) return;
        setNote("No image URL returned from generate");
        return;
      }
      setPreviews(built);
      const partial =
        typeof data.requested === "number" && built.length < data.requested;
      setNote(
        partial
          ? `${built.length} of ${data.requested} ready (others timed out). Keep the ones you have.`
          : `${built.length} ready — scroll up and tap Keep to save to your album.`
      );
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        /* */
      }
    } catch (err: unknown) {
      const recovered = await recoverLatestPreview(generationStartedAt);
      if (!recovered) {
        setNote(
          err instanceof Error
            ? err.message
            : "The connection ended before the image could be recovered. Please try again."
        );
      }
    } finally {
      generateInFlightRef.current = false;
      setBusy(false);
    }
  }

  async function saveOne(index: number) {
    const item = previews[index];
    if (!item || item.saved) return;
    if (!item.url) {
      setNote("No image URL to keep");
      return;
    }
    setBusy(true);
    setNote("Keeping in your album…");
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: item.url,
          path: item.path,
          kind: item.kind || "image",
          prompt: item.prompt || "",
          id: item.id || undefined,
        }),
      });
      let data: LibraryResponse = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Keep failed with status ${res.status}` };
      }
      if (!res.ok) {
        const msg =
          data.error ||
          data.message ||
          `Keep failed (${res.status}). Check library bucket + generations table.`;
        setNote(msg);
        return;
      }
      setPreviews((prev) =>
        prev.map((p, i) =>
          i === index
            ? {
                ...p,
                saved: true,
                id: data.id || p.id || null,
                path: data.path || p.path,
                url: data.url || p.url,
              }
            : p
        )
      );
      setNote("Kept — open Library or Scenes to see it.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setNote(msg);
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
      setNote(err instanceof Error ? err.message : "Delete failed");
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
      <div className="studio-hero">
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            color: "var(--tor-text, #1a1614)",
            fontSize: "1.65rem",
            fontWeight: 500,
            margin: "0 0 0.35rem",
          }}
        >
          {sceneName}
        </h1>
        <p className="text-sm text-[var(--muted)]">Choose who is in this scene, then generate.</p>
        <p style={{ fontSize: 12, color: "#8a7350", marginTop: 10, letterSpacing: "0.04em" }}>
          Face · Scene · Keep
        </p>
      </div>

      {/* Keep panel — sticky, always on top after generate */}
      <div ref={previewRef}>
        {previews.length > 0 && (
          <div
            className="card"
            style={{
              maxWidth: "36rem",
              border: "2px solid #8B4A54",
              position: "sticky",
              top: 8,
              zIndex: 60,
              background: "#fff",
              boxShadow: "0 12px 40px rgba(26,18,20,0.15)",
            }}
          >
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[var(--text)]">
                {previews.length > 1
                  ? `${previews.length} versions — Keep the ones you want`
                  : "Your image — Keep or discard"}
              </p>
              <div className="flex gap-3 text-sm">
                {previews.some((p) => p.saved) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span role="status" aria-live="polite" className="font-semibold text-[var(--text)]">
                      ✓ Kept in Library
                    </span>
                    <Link href="/library" className="underline text-[var(--text)]">
                      Open library
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">
              Preview only — not in your album until you Keep. Discard removes it. Download is optional.
            </p>
            <div
              className={`tor-preview-grid ${
                previews.length === 1 ? "tor-preview-grid--single" : "tor-preview-grid--multi"
              }`}
            >
              {previews.map((item, index) => (
                <div key={`${item.url}-${index}`} className="rounded-xl border border-[var(--line)] p-2 sm:p-3 bg-white min-w-0">
                  <div className="tor-preview-frame ring-1 ring-black/10">
                    <img
                      src={item.url}
                      alt={`Version ${index + 1}`}
                      className="tor-img"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2">Version {index + 1}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-studio-primary text-xs px-3 py-1.5"
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
      <div className="card tor-stack" style={{ maxWidth: "36rem" }}>
        <p className="text-sm font-semibold text-[var(--text)]">Create</p>

        <div className="tor-face-row">
          {shown.length === 0 && (
            <p className="tor-help">Select cast below, or upload a photo.</p>
          )}
          {shown.map((f) => (
            <div key={f.role} className="tor-face-chip">
              <div className="frame">
                {f.url && (
                  <img src={f.url} alt={f.role} className="tor-img" />
                )}
              </div>
              <div className="cap">
                {ALL_ROLES.find((r) => r.key === f.role)?.label || f.role}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="tor-select-wrap">
            <span className="tor-select-label">Media</span>
            <select
              className="tor-select"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>

        
        <div className="border-t border-[var(--line)] pt-4">
          <p className="text-sm font-semibold mb-1.5 text-[var(--text)]">Add me in this outfit</p>
          <p className="text-xs text-[var(--muted)] mb-2">
            Pick one from the outfit library below, or upload your own. We put the chosen person into that exact look.
          </p>

          {outfitPresets.length > 0 && (
            <div className="mb-4">
              {OUTFIT_CATEGORY_ORDER.map((category) => {
                const items = outfitPresets.filter((item) => item.category === category);
                if (!items.length) return null;
                return (
                  <div key={category} className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-[var(--text)]">
                      {OUTFIT_CATEGORY_LABELS[category]}
                    </p>
                    <div className="tor-preset-grid">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => void applyOutfitPreset(item)}
                          disabled={busy}
                          className="tor-preset-cell"
                          style={
                            pickedOutfitPreset === item.id
                              ? { boxShadow: "0 0 0 2px var(--tor-accent, #8b4a54)" }
                              : undefined
                          }
                        >
                          <div
                            className="frame"
                            style={{ background: "linear-gradient(to bottom right, #3A1F24, #8B4A55)" }}
                          >
                            <img
                              src={item.src}
                              alt={item.name}
                              className="tor-img"
                              loading="lazy"
                            />
                          </div>
                          <div className="meta">
                            <strong>{item.name}</strong>
                            <span>{OUTFIT_CATEGORY_LABELS[item.category]}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <button
              type="button"
              onClick={() => outfitFileRef.current?.click()}
              disabled={busy}
              className="tor-chip"
              style={{ minHeight: 48, padding: "12px 22px", fontSize: 15 }}
            >
              Upload outfit photo
            </button>
            <input
              ref={outfitFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp"
              style={{ display: "none" }}
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
                  setPickedOutfitPreset(null);
                }}
              >
                Clear outfit
              </button>
            )}
          </div>
          {outfitPreview && (
            <div className="flex gap-3 items-start mb-2">
              <div style={{ width: 56, height: 74, borderRadius: 12, overflow: "hidden", background: "#3A1F24", flexShrink: 0 }}>
                <img src={outfitPreview} alt="Outfit" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-[var(--text)]">Who wears it</label>
                <select
                  className="tor-select"
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
            <p className="tor-select-label" style={{ marginBottom: 8 }}>
              How many to make
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { n: 1, label: "One" },
                { n: 2, label: "Two" },
                { n: 3, label: "Three" },
                { n: 4, label: "Four" },
              ].map(({ n, label }) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setVersions(n)}
                  className={versions === n ? "tor-chip tor-chip-on" : "tor-chip"}
                  style={{ minHeight: 44, padding: "10px 18px", fontSize: 14 }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="tor-help" style={{ marginTop: 10 }}>
              Same scene each time — only framing or light shifts slightly. Keep the ones you like.
            </p>
          </div>
        )}

        <button
          className="btn btn-studio-primary w-full"
          onClick={generate}
          disabled={busy}
          style={{
            position: "sticky",
            bottom: 12,
            zIndex: 20,
            boxShadow: "0 8px 24px rgba(139,74,84,0.35)",
          }}
        >
          {busy
            ? "Making…"
            : kind === "image" && versions > 1
              ? `Make ${versions} versions`
              : "Make this scene"}
        </button>
        {note && (
          <p
            className="text-sm text-[var(--muted)]"
            role="status"
            aria-live="polite"
          >
            {note}
          </p>
        )}
      </div>

      {/* Cast */}
      <div className="card" style={{ maxWidth: "36rem" }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#1a1614" }}>Cast</p>
        <div className="tor-chip-grid tor-chip-grid-4">
          {ALL_ROLES.map((r) => {
            const on = selected.includes(r.key);
            const hasFace = allFaces.some((f) => f.role === r.key && f.url);
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => toggleRole(r.key)}
                className={`tor-chip${on ? " tor-chip-on" : ""}${!hasFace && on ? " tor-chip-warn" : ""}`}
                style={{ width: "100%" }}
              >
                {r.label}
                {on && !hasFace ? " · photo" : ""}
              </button>
            );
          })}
        </div>
        <p className="tor-help" style={{ marginTop: 10 }}>
          Tap to add or remove. Each selected role needs a photo.
        </p>

        <p style={{ fontSize: 14, fontWeight: 600, margin: "20px 0 10px", color: "#1a1614" }}>
          Suggested partners
        </p>
        <div className="tor-chip-grid">
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
                className={`tor-chip${on ? " tor-chip-on" : ""}`}
                style={{ width: "100%" }}
              >
                {s.label}
                {missing.length ? " · photo" : ""}
              </button>
            );
          })}
        </div>

        {/* Upload from phone / Mac */}
        <p className="text-sm font-semibold mt-5 mb-2 text-[var(--text)]">Upload a face</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="tor-select"
            style={{ flex: 1, minWidth: 140 }}
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
            className="tor-chip"
            style={{ minHeight: 48, padding: "12px 22px", fontSize: 15 }}
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            Choose face photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,.jpg,.jpeg,.png,.webp"
                        style={{ display: "none" }}
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
        <div className="tor-preset-grid">
          {WOMAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={busy}
              className="tor-preset-cell"
              style={
                picked === p.id
                  ? { boxShadow: "0 0 0 2px var(--tor-accent, #8b4a54)" }
                  : undefined
              }
            >
              <div className="frame" style={{ background: "linear-gradient(to bottom right, #3A1F24, #8B4A55)" }}>
                <img
                  src={`/presets/${p.id}.jpg`}
                  alt={p.name}
                  className="tor-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="meta">
                <strong>{p.name}</strong>
                <span>{p.age} · {p.body_shape}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-sm font-semibold mt-5 mb-2 text-[var(--text)]">6 men</p>
        <div className="tor-preset-grid">
          {MAN_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              disabled={busy}
              className="tor-preset-cell"
              style={
                picked === p.id
                  ? { boxShadow: "0 0 0 2px var(--tor-accent, #8b4a54)" }
                  : undefined
              }
            >
              <div className="frame" style={{ background: "linear-gradient(to bottom right, #1C1917, #4A3B32)" }}>
                <img
                  src={`/presets/${p.id}.jpg`}
                  alt={p.name}
                  className="tor-img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="meta">
                <strong>{p.name}</strong>
                <span>{p.age} · {p.body_shape}</span>
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
