import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSceneCore } from "@/lib/scene-cores";

export const runtime = "nodejs";
export const maxDuration = 300;

const ZEN_BASE = "https://api.zencreator.pro/api/public/v1";

type PersonRecord = {
  role: string;
  photo_path?: string;
  photo_body?: string;
  photo_angle?: string;
  age?: unknown;
  body_shape?: unknown;
  breasts?: unknown;
  penis?: unknown;
  look?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function pushUrl(out: string[], v: unknown) {
  if (typeof v === "string" && v.startsWith("http") && !out.includes(v)) out.push(v);
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.url === "string") pushUrl(out, o.url);
    if (typeof o.download_url === "string") pushUrl(out, o.download_url);
    if (typeof o.image_url === "string") pushUrl(out, o.image_url);
  }
}

function extractUrls(payload: unknown): string[] {
  const out: string[] = [];
  const root = asRecord(payload);
  if (!root) return out;
  const data = asRecord(root.data);
  const bags: unknown[] = [root, data, root.result, data?.result, root.output];
  for (const value of bags) {
    const bag = asRecord(value);
    if (!bag) continue;
    pushUrl(out, bag.url);
    pushUrl(out, bag.download_url);
    pushUrl(out, bag.image_url);
    for (const key of ["outputs", "images", "results", "files"]) {
      const arr = bag[key];
      if (Array.isArray(arr)) {
        for (const item of arr) pushUrl(out, item);
      }
    }
  }
  return out;
}

async function zenUpload(key: string, bytes: ArrayBuffer, name: string) {
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "image/jpeg" }), name);
  form.append("media_type", "image/jpeg");
  const r = await fetch(`${ZEN_BASE}/assets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error?.message || body.message || `Upload failed ${r.status}`);
  const id = body.asset_id || body.id || body.data?.asset_id;
  if (!id) throw new Error("No asset id from Zen");
  return String(id);
}

function bodyLine(p: PersonRecord) {
  const role = String(p.role || "").replace(/_/g, " ");
  const male = role.includes("husband") || role.includes("male");
  const female = role.includes("wife") || role.includes("female");
  const bits: string[] = [role];
  if (p.age) bits.push(`clearly in their ${p.age}, visible age on the face and body`);
  if (p.body_shape) {
    const shape = String(p.body_shape);
    if (["large", "heavy", "full", "curvy"].includes(shape)) {
      if (male) {
        bits.push(
          `${shape} body, thicker midsection, softer chest, not athletic, not slim, not a gym body`
        );
      } else if (female) {
        bits.push(`${shape} feminine body, soft curves, not skinny, not athletic model`);
      } else {
        bits.push(`${shape} body`);
      }
    } else {
      bits.push(`${shape} body`);
    }
  }
  if (p.breasts) {
    bits.push(`${String(p.breasts)} natural breasts, in proportion to her body`);
  }
  if (p.penis && male) {
    const size = String(p.penis);
    if (size === "very large") {
      bits.push("very large thick penis, visibly well endowed, attached only to this man");
    } else if (size === "large") {
      bits.push("large penis, above average, clearly visible, attached only to this man");
    } else {
      bits.push("average realistic penis, not oversized, attached only to this man");
    }
  }
  if (p.look) bits.push(String(p.look));
  return bits.join(", ");
}

function anatomyLock(cast: { role?: string }[]) {
  const roles = cast.map((p) => String(p.role || ""));
  const men = roles.filter((r) => r.includes("husband") || r.includes("male")).length;
  const women = roles.filter((r) => r.includes("wife") || r.includes("female")).length;
  const total = men + women || cast.length;

  const penisRule =
    men === 0
      ? "no penis anywhere in the image"
      : men === 1
        ? "exactly one penis, attached only to the man at his hips/groin, never attached to a woman, never growing from a chest or breasts, never floating, never between a woman's breasts as if it belongs to her"
        : `exactly ${men} penises, one attached to each man at his hips/groin, none attached to a woman, no extra or anonymous shafts, no floating genitals`;

  return [
    "ANATOMY LOCK:",
    "correct adult human anatomy only.",
    `exactly ${total} people, no extra people.`,
    penisRule,
    "women have only female genitals (vulva), men have only male genitals (penis).",
    "no extra limbs, no extra hands, no fused bodies, no body parts on the wrong person.",
  ].join(" ");
}

const GLOBAL_NEGATIVES =
  "wrong room, shower stall when not requested, bathroom tiles when not requested, steam mirror selfie when not requested, standing wet couple when not requested, different sex act than described, swapped positions, wrong number of people, extra person, extra limbs, fused bodies, deformed genitals, beauty-filter face, different hair than reference, watermark, text overlay, logo, identical twin faces";

const VERSION_VARIANTS = [
  "",
  "CAMERA ONLY: slightly wider full-body framing; same people, same act, same room type as the scene description.",
  "CAMERA ONLY: tighter crop on faces and torsos; same people, same act, same room type as the scene description.",
  "LIGHT ONLY: warmer side light, softer shadows; same people, same act, same room type as the scene description.",
];

const SHOWER_SCENES = new Set([
  "romance-shower",
  "soft-shower-laugh",
  "zen-shower-pose",
  "zen-foam-shower",
  "zen-carpet-kneel",
  "zen-low-angle",
]);

export async function POST(req: NextRequest) {
  const key = process.env.ZENCREATOR_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing ZENCREATOR_API_KEY in .env.local" }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const body = await req.json();
  const sceneName = String(body.sceneName || "erotic couple scene");
  const who = String(body.who || "couple");
  const kind = String(body.kind || "image");
  const sceneId = String(body.sceneId || "");
  const versions = Math.min(4, Math.max(1, Number(body.versions) || 1));
  const outfitPath = body.outfitPath ? String(body.outfitPath) : null;
  const outfitWearer = body.outfitWearer ? String(body.outfitWearer) : null;

  const { data: memberships } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userData.user.id)
    .limit(1);
  const studioId = memberships?.[0]?.studio_id;
  if (!studioId) {
    return NextResponse.json({ error: "No studio" }, { status: 400 });
  }

  const { data: people } = await supabase.from("people").select("*").eq("studio_id", studioId);

  const wanted = who.includes(",")
    ? who.split(",").map((s: string) => s.trim()).filter(Boolean)
    : who === "couple"
      ? ["wife", "husband"]
      : [who].filter(Boolean);

  const peopleRows = (people || []) as PersonRecord[];
  const castPeople = peopleRows.filter((p) => wanted.includes(p.role || ""));
  castPeople.sort((a, b) => wanted.indexOf(a.role || "") - wanted.indexOf(b.role || ""));
  const refs = castPeople.filter((p) => p.photo_path);

  type PathItem = { role: string; kind: "face" | "body" | "angle"; path: string };
  const chosen: PathItem[] = [];

  for (const person of refs) {
    if (person.photo_path && chosen.length < 3) {
      chosen.push({ role: person.role, kind: "face", path: person.photo_path });
    }
  }

  if (chosen.length < 3) {
    for (const person of refs) {
      if (chosen.length >= 3) break;
      if (person.photo_body) {
        chosen.push({ role: person.role, kind: "body", path: person.photo_body });
      }
    }
  }
  if (chosen.length < 3) {
    for (const person of refs) {
      if (chosen.length >= 3) break;
      if (person.photo_angle) {
        chosen.push({ role: person.role, kind: "angle", path: person.photo_angle });
      }
    }
  }

  const personAssetIds: string[] = [];
  for (const item of chosen) {
    const { data: file, error } = await supabase.storage.from("people").download(item.path);
    if (error || !file) continue;
    const bytes = await file.arrayBuffer();
    personAssetIds.push(await zenUpload(key, bytes, `${item.role}-${item.kind}.jpg`));
  }

  let outfitAssetId: string | null = null;
  let outfitLock = "";
  const wearer = (outfitWearer || wanted[0] || "wife").replace(/_/g, " ");

  if (outfitPath) {
    try {
      let file: Blob | null = null;
      let error: { message?: string } | null = null;

      if (outfitPath.startsWith(`${studioId}/`)) {
        const result = await supabase.storage.from("library").download(outfitPath);
        file = result.data;
        error = result.error;
      } else {
        const result = await supabase.storage.from("outfits").download(outfitPath);
        file = result.data;
        error = result.error;
      }

      if (!error && file) {
        const bytes = await file.arrayBuffer();
        outfitAssetId = await zenUpload(key, bytes, "outfit-ref.jpg");
        outfitLock =
          `OUTFIT LOCK: use the outfit reference only for clothing. Put the ${wearer} into that exact outfit — same garment, colour, fabric, cut, and details. The ${wearer}'s face and identity must come from their own face reference, never from any person shown in the outfit image. Do not invent different clothes.`;
      }
    } catch {
      // continue without outfit
    }
  }

  const applyOutfitSecondPass = Boolean(outfitAssetId && personAssetIds.length >= 3);
  const assetIds = [...personAssetIds];
  if (outfitAssetId && !applyOutfitSecondPass && assetIds.length < 3) {
    assetIds.push(outfitAssetId);
  }

  let core = "";
  if (sceneId) {
    const { data: dbScene, error: dbSceneError } = await supabase
      .from("scenes")
      .select("id,tab,title,prompt")
      .eq("id", sceneId)
      .maybeSingle();

    if (!dbSceneError && dbScene?.prompt) {
      core = String(dbScene.prompt);
    } else if (dbSceneError) {
      console.error("Supabase scene lookup failed", dbSceneError);
    }
  }

  if (!core) {
    core = getSceneCore(
      sceneId || (outfitPath ? "outfit-try-on" : ""),
      sceneName || (outfitPath ? "Outfit try-on" : "erotic couple scene")
    );
  }

  // Scene table used to repeat LOOK; the wrapper owns look now.
  core = core.replace(/\s*LOOK:\s*.+$/i, "").trim();

  const labels = (castPeople.length ? castPeople : refs).map((p) =>
    p.role.replace(/_/g, " ")
  );
  core = core
    .replace(/\{p1\}/g, labels[0] || "the woman")
    .replace(/\{p2\}/g, labels[1] || "the man")
    .replace(/\{p3\}/g, labels[2] || "the third person");

  const refParts = chosen.map(
    (c, i) => `reference ${i + 1} is the ${c.role.replace(/_/g, " ")} ${c.kind} photo`
  );
  if (outfitAssetId && !applyOutfitSecondPass && assetIds.length > personAssetIds.length) {
    refParts.push(`reference ${assetIds.length} is the outfit reference for the ${wearer}`);
  }
  const refGuide = refParts.join("; ");
  const whoLine =
    refs.length <= 1
      ? `WHO: exactly one adult — ${labels[0] || "the subject"}. ${refGuide}. Do not add anyone else.`
      : `WHO: exactly ${refs.length} adults — ${labels.join(" and ")}. ${refGuide}. Do not add extra people or extra genitals. Do not change anyone's race, skin tone, age, or hair to match a stereotype in the scene text. The uploaded faces win.`;

  const faceLock =
    "FACE LOCK: use the face photos as identity. Same bone structure, eyes, nose, mouth, skin tone, hair colour and style as the face references. Body photos are only for body shape and posture — do not change the face from the face references. Do not invent a different person. Do not beautify into a model.";

  const selectedPeople = peopleRows.filter((p) => wanted.includes(p.role || ""));
  const hasBodyHints = selectedPeople.some(
    (p) => p.age || p.body_shape || p.breasts || p.penis || p.look
  );
  const bodyNotes = selectedPeople.map(bodyLine).join(". ");
  const bodyLock =
    hasBodyHints && bodyNotes
      ? `BODY NOTE: ${bodyNotes}. Treat these as shape hints the couple chose. Keep the faces from the face references. Do not replace the person. Do not ignore a face photo in favour of a generic body.`
      : "";

  const anatomy = anatomyLock(castPeople.length ? castPeople : refs);

  const look =
    "LOOK: vertical 3:4 photoreal photograph, natural skin texture, real fabric, sharp readable faces, no watermark, no text. Obey the camera, lens, lighting and room written in SCENE. Do not switch the lens to 85mm unless the scene says 85mm.";

  const locationGuard = SHOWER_SCENES.has(sceneId)
    ? "Setting: bathroom shower as described."
    : "Setting: match the SCENE room. Not a shower unless the scene is a shower scene.";

  const avoidLine = `AVOID: ${GLOBAL_NEGATIVES}`;

  // Scene act comes before look so the shot list wins.
  const promptBase = [whoLine, faceLock, anatomy, outfitLock, `SCENE: ${core}`, bodyLock, locationGuard, look, avoidLine]
    .filter(Boolean)
    .join(" ");

  async function runOne(versionIndex: number): Promise<string | null> {
    const variant = VERSION_VARIANTS[versionIndex] || "";
    const prompt = variant ? `${promptBase} ${variant}` : promptBase;
    const tool = assetIds.length ? "image_editor" : "by_prompt";
    // image_editor rejects unknown fields (e.g. negative_prompt).
    // AVOID: stays in the prompt text; only by_prompt gets negative_prompt.
    const input = assetIds.length
      ? {
          image_assets: assetIds.slice(0, 3),
          prompt,
          ratio: "3:4",
          number_of_images: 1,
          model: "SEEDREAM_5_PRO",
        }
      : {
          positive_prompt: prompt,
          negative_prompt: GLOBAL_NEGATIVES,
          ratio: "3:4",
          batch_size: 1,
          model: "SEEDREAM_5_PRO",
        };

    const submit = await fetch(`${ZEN_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tool, input }),
    });
    const submitted = await submit.json().catch(() => ({}));
    if (!submit.ok) {
      throw new Error(submitted.error?.message || submitted.message || `Zen error ${submit.status}`);
    }

    let urls = extractUrls(submitted);
    const genId = submitted.id || submitted.generation_id || submitted.data?.id;
    if (!urls.length && genId) {
      const maxPolls = versions > 1 ? 24 : 40;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        const polled = await poll.json().catch(() => ({}));
        const status = String(polled.status || polled.state || "").toLowerCase();
        urls = extractUrls(polled);
        if (!urls.length) {
          try {
            const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
              headers: { Authorization: `Bearer ${key}` },
            });
            urls = extractUrls(await resultRes.json().catch(() => ({})));
          } catch {
            // ignore
          }
        }
        if (urls.length) break;
        if (["failed", "error", "cancelled"].includes(status)) {
          throw new Error(polled.error || polled.message || "Generation failed");
        }
      }
    }
    return urls[0] || null;
  }

  async function applyOutfitToGeneratedImage(sourceUrl: string): Promise<string | null> {
    if (!applyOutfitSecondPass || !outfitAssetId) return sourceUrl;

    const sourceBytes = await (await fetch(sourceUrl)).arrayBuffer();
    const sourceAsset = await zenUpload(key, sourceBytes, "identity-locked-scene.jpg");
    const prompt = [
      `EDIT ONLY THE CLOTHING ON THE ${wearer.toUpperCase()}.`,
      `Reference 1 is the already-generated scene. Preserve every person's face, identity, body, pose, position, expression, anatomy, lighting, framing and background exactly.`,
      `Reference 2 is the outfit reference. Dress only the ${wearer} in that exact garment — same colour, fabric, cut and visible details.`,
      `Do not replace, redraw, beautify or change any face. Do not add or remove people. Do not change any other person's clothing.`,
    ].join(" ");

    const submit = await fetch(`${ZEN_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "image_editor",
        input: {
          image_assets: [sourceAsset, outfitAssetId],
          prompt,
          ratio: "3:4",
          number_of_images: 1,
          model: "SEEDREAM_5_PRO",
        },
      }),
    });

    const submitted = await submit.json().catch(() => ({}));
    if (!submit.ok) {
      throw new Error(submitted.error?.message || submitted.message || `Outfit edit failed ${submit.status}`);
    }

    let urls = extractUrls(submitted);
    const genId = submitted.id || submitted.generation_id || submitted.data?.id;
    if (!urls.length && genId) {
      for (let i = 0; i < 32; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        const polled = await poll.json().catch(() => ({}));
        urls = extractUrls(polled);
        if (!urls.length) {
          try {
            const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
              headers: { Authorization: `Bearer ${key}` },
            });
            urls = extractUrls(await resultRes.json().catch(() => ({})));
          } catch {
            // ignore
          }
        }
        if (urls.length) break;
        const status = String(polled.status || polled.state || "").toLowerCase();
        if (["failed", "error", "cancelled"].includes(status)) break;
      }
    }
    return urls[0] || sourceUrl;
  }

  const urls: string[] = [];
  const errors: string[] = [];
  for (let i = 0; i < versions; i++) {
    try {
      const firstPass = await runOne(i);
      if (firstPass) {
        const finalUrl = applyOutfitSecondPass ? await applyOutfitToGeneratedImage(firstPass) : firstPass;
        if (finalUrl) urls.push(finalUrl);
        else errors.push(`v${i + 1}: outfit pass returned no url`);
      } else {
        errors.push(`v${i + 1}: no url`);
      }
    } catch (error: unknown) {
      errors.push(`v${i + 1}: ${errorMessage(error)}`);
    }
  }

  if (!urls.length) {
    const msg = errors[0] || "Timed out waiting for the image";
    return NextResponse.json({ error: msg, details: errors }, { status: 504 });
  }

  const prompt = `${sceneId} | ${sceneName} (${who})`;
  const items: { url: string; path: string | null; id: string | null }[] = [];

  for (let i = 0; i < urls.length; i++) {
    let itemUrl = urls[i];
    let path: string | null = null;
    try {
      const img = await fetch(itemUrl);
      const bytes = await img.arrayBuffer();
      path = `${studioId}/preview/${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}.jpg`;
      await supabase.storage.from("library").upload(path, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(path, 60 * 60 * 24);
      if (signed?.signedUrl) itemUrl = signed.signedUrl;
    } catch {
      // keep Zen URL
    }

    items.push({
      url: itemUrl,
      path,
      id: null,
    });
  }

  const itemsOut: { url: string; path: string | null; id: string | null }[] = [];
  for (const it of items) {
    let id: string | null = null;
    if (it.path || it.url) {
      try {
        const row: Record<string, unknown> = {
          studio_id: studioId,
          kind,
          prompt,
          result_url: it.url,
          status: "preview",
        };
        if (it.path) row.storage_path = it.path;
        const { data: ins } = await supabase
          .from("generations")
          .insert(row)
          .select("id")
          .single();
        id = ins?.id || null;
      } catch {
        /* optional */
      }
    }
    itemsOut.push({ ...it, id });
  }

  return NextResponse.json({
    partial: itemsOut.length < versions,
    requested: versions,
    url: itemsOut[0]?.url || null,
    path: itemsOut[0]?.path || null,
    id: itemsOut[0]?.id || null,
    kind,
    prompt,
    saved: false,
    status: "preview",
    versions: itemsOut.length,
    items: itemsOut,
  });
}
