import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSceneCore } from "@/lib/scene-cores";
import { buildPromptRules } from "@/lib/prompt-rules";

const ZEN_BASE = "https://api.zencreator.pro/api/public/v1";

function pushUrl(out: string[], v: unknown) {
  if (typeof v === "string" && v.startsWith("http") && !out.includes(v)) out.push(v);
  else if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (typeof o.url === "string") pushUrl(out, o.url);
    if (typeof o.download_url === "string") pushUrl(out, o.download_url);
    if (typeof o.image_url === "string") pushUrl(out, o.image_url);
  }
}

function extractUrls(payload: any): string[] {
  const out: string[] = [];
  if (!payload || typeof payload !== "object") return out;
  const bags = [payload, payload.data, payload.result, payload.data?.result, payload.output];
  for (const bag of bags) {
    if (!bag || typeof bag !== "object") continue;
    pushUrl(out, bag.url);
    pushUrl(out, bag.download_url);
    pushUrl(out, bag.image_url);
    for (const key of ["outputs", "images", "results", "files"]) {
      const arr = (bag as any)[key];
      if (Array.isArray(arr)) {
        for (const item of arr) pushUrl(out, item);
      }
    }
  }
  return out;
}

function extractUrl(payload: any): string | null {
  return extractUrls(payload)[0] || null;
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

function bodyLine(p: any) {
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
        bits.push(
          `${shape} feminine body, soft curves, not skinny, not athletic model`
        );
      } else {
        bits.push(`${shape} body`);
      }
    } else {
      bits.push(`${shape} body`);
    }
  }
  if (p.breasts) {
    const b = String(p.breasts);
    bits.push(`${b} natural breasts, in proportion to her body`);
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

function refineAnatomyPrompt(men: number) {
  if (men <= 0) {
    return "Keep the same people, faces, pose and lighting. Fix anatomy only: remove any penis. Women must have only female anatomy. No extra limbs.";
  }
  if (men === 1) {
    return "Keep the same people, faces, pose and lighting. Fix anatomy only: there must be exactly one penis and it must be attached only to the man at his hips. Remove any penis growing from a woman, from a chest, or floating. Women have only vulvas. No extra limbs or fused bodies.";
  }
  return `Keep the same people, faces, pose and lighting. Fix anatomy only: exactly ${men} penises, each attached only to a man at his hips. Remove any extra, anonymous, or floating penises. Women have only vulvas. No extra limbs or fused bodies.`;
}

const VERSION_VARIANTS = [
  "", // v1 — base scene
  "VARIATION: wider full-body framing, more of the room and posture visible, same people and act.",
  "VARIATION: tighter intimate crop on faces and torsos, same people and act.",
  "VARIATION: warmer side light, slightly moodier shadows, same people, pose family, and act.",
];

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

  const castPeople = (people || []).filter((p: any) => wanted.includes(p.role));
  castPeople.sort((a: any, b: any) => wanted.indexOf(a.role) - wanted.indexOf(b.role));
  const refs = castPeople.filter((p: any) => p.photo_path);

  // Build up to 3 Zen assets: every face first, then body, then angle
  type PathItem = { role: string; kind: string; path: string };
  const candidates: PathItem[] = [];
  for (const person of refs) {
    if (person.photo_path) candidates.push({ role: person.role, kind: "face", path: person.photo_path });
  }
  for (const person of refs) {
    if (person.photo_body) candidates.push({ role: person.role, kind: "body", path: person.photo_body });
  }
  for (const person of refs) {
    if (person.photo_angle) candidates.push({ role: person.role, kind: "angle", path: person.photo_angle });
  }
  const chosen = candidates.slice(0, 3);

  const assetIds: string[] = [];
  for (const item of chosen) {
    const { data: file, error } = await supabase.storage.from("people").download(item.path);
    if (error || !file) continue;
    const bytes = await file.arrayBuffer();
    assetIds.push(await zenUpload(key, bytes, `${item.role}-${item.kind}.jpg`));
  }

  // Outfit reference (try-on / who wore it best) — first asset when present
  let outfitLock = "";
  if (outfitPath && outfitPath.startsWith(`${studioId}/`)) {
    try {
      const { data: file, error } = await supabase.storage.from("library").download(outfitPath);
      if (!error && file) {
        const bytes = await file.arrayBuffer();
        const outfitAsset = await zenUpload(key, bytes, "outfit-ref.jpg");
        assetIds.unshift(outfitAsset);
        // Keep at most 3 assets total (Zen limit we use)
        while (assetIds.length > 3) assetIds.pop();
        const wearer = (outfitWearer || wanted[0] || "wife").replace(/_/g, " ");
        outfitLock =
          `OUTFIT LOCK: Reference image 1 is the OUTFIT only (clothing on a hanger, mannequin, or another body). Put the ${wearer} into that exact outfit — same garment, colour, fabric, cut, and details. The ${wearer} face and identity come from their face reference, never from whoever appears in the outfit photo. Do not invent different clothes.`;
        if (!sceneId || sceneId === "free-play") {
          // force try-on core if free play with outfit
        }
      }
    } catch {
      // continue without outfit
    }
  }

  // 1) Scene core from catalog
  let core = getSceneCore(
    sceneId || (outfitPath ? "outfit-try-on" : ""),
    sceneName || (outfitPath ? "Outfit try-on" : "erotic couple scene")
  );
  const labels = (castPeople.length ? castPeople : refs).map((p: any) =>
    p.role.replace(/_/g, " ")
  );
  core = core
    .replace(/\{p1\}/g, labels[0] || "the woman")
    .replace(/\{p2\}/g, labels[1] || "the man")
    .replace(/\{p3\}/g, labels[2] || "the third person");

  // 2) Who — map reference slots to people
  const refGuide = chosen
    .map((c, i) => `reference ${i + 1} is the ${c.role.replace(/_/g, " ")} ${c.kind} photo`)
    .join("; ");
  const whoLine =
    refs.length <= 1
      ? `WHO: exactly one adult — ${labels[0] || "the subject"}. ${refGuide}. Do not add anyone else.`
      : `WHO: exactly ${refs.length} adults — ${labels.join(" and ")}. ${refGuide}. Do not add extra people or extra genitals.`;

  // 3) Face lock
  const faceLock =
    "FACE LOCK: use the face photos as identity. Same bone structure, eyes, nose, mouth, hair colour and style as the face references. Body photos are only for body shape and posture — do not change the face from the face references. Do not invent a different person.";

  // 4) Body lock from People dropdowns
  const bodyNotes = (people || [])
    .filter((p: any) => wanted.includes(p.role))
    .map(bodyLine)
    .join(". ");
  const bodyLock = bodyNotes
    ? `BODY LOCK: ${bodyNotes}. These body settings OVERRIDE the body in the reference photos. Keep the faces. Change the body to match the settings.`
    : "";

  // 5) Anatomy lock
  const anatomy = anatomyLock(castPeople.length ? castPeople : refs);

  // 6) Look
  const look =
    "LOOK: vertical 3:4 frame, ultra high-resolution luxury photoshoot, 85mm f/1.4, soft cinematic light, glossy hydrated skin, tack-sharp faces, magazine grade, 8k, no watermark, no text.";

  const locationId = body.locationId ? String(body.locationId) : undefined;
  const isSoftHero =
    sceneId === "romance-morning" ||
    sceneId === "soft-hero" ||
    sceneId === "soft_hero_v1" ||
    (!sceneId && !outfitPath);
  const rules = buildPromptRules({
    sceneId,
    sceneName,
    locationId,
    personCount: Math.max(refs.length, wanted.length, 1),
    isSoftHero,
  });

  const promptBase = [
    whoLine,
    faceLock,
    bodyLock,
    anatomy,
    rules.anatomyPositive,
    rules.locationLine,
    outfitLock,
    core,
    look,
    rules.negativeLine,
  ]
    .filter(Boolean)
    .join(" ");

  async function runOne(versionIndex: number): Promise<string | null> {
    const variant = VERSION_VARIANTS[versionIndex] || "";
    const prompt = variant ? `${promptBase} ${variant}` : promptBase;
    const tool = assetIds.length ? "image_editor" : "by_prompt";
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
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
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

  // Run versions: v1 base; v2 wider camera; v3 tighter crop; v4 lighting (in parallel)
  const jobs = Array.from({ length: versions }, (_, i) => runOne(i));
  const settled = await Promise.allSettled(jobs);
  let urls = settled
    .filter((s): s is PromiseFulfilledResult<string | null> => s.status === "fulfilled")
    .map((s) => s.value)
    .filter((u): u is string => Boolean(u));

  if (!urls.length) {
    const firstErr = settled.find((s) => s.status === "rejected") as PromiseRejectedResult | undefined;
    const msg = firstErr?.reason?.message || "Timed out waiting for the image";
    return NextResponse.json({ error: msg }, { status: 504 });
  }

  // Optional anatomy refine only for single 3-person result
  const menCount = (castPeople.length ? castPeople : refs).filter((p: any) => {
    const r = String(p.role || "");
    return r.includes("husband") || r.includes("male");
  }).length;
  if (versions === 1 && (castPeople.length || refs.length) >= 3) {
    try {
      let url = urls[0];
      const firstBytes = await (await fetch(url)).arrayBuffer();
      const fixAsset = await zenUpload(key, firstBytes, "anatomy-fix.jpg");
      const fixPrompt = refineAnatomyPrompt(menCount);
      const fixSubmit = await fetch(`${ZEN_BASE}/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool: "image_editor",
          input: {
            image_assets: [fixAsset],
            prompt: fixPrompt,
            ratio: "3:4",
            number_of_images: 1,
            model: "SEEDREAM_5_PRO",
          },
        }),
      });
      const fixBody = await fixSubmit.json().catch(() => ({}));
      let fixedUrl = extractUrl(fixBody);
      const fixId = fixBody.id || fixBody.generation_id || fixBody.data?.id;
      if (!fixedUrl && fixId) {
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const poll = await fetch(`${ZEN_BASE}/generations/${fixId}`, {
            headers: { Authorization: `Bearer ${key}` },
          });
          const polled = await poll.json().catch(() => ({}));
          fixedUrl = extractUrl(polled);
          if (!fixedUrl) {
            try {
              const resultRes = await fetch(`${ZEN_BASE}/generations/${fixId}/result`, {
                headers: { Authorization: `Bearer ${key}` },
              });
              fixedUrl = extractUrl(await resultRes.json().catch(() => ({})));
            } catch {
              // ignore
            }
          }
          if (fixedUrl) break;
          const status = String(polled.status || polled.state || "").toLowerCase();
          if (["failed", "error", "cancelled"].includes(status)) break;
        }
      }
      if (fixedUrl) urls = [fixedUrl];
    } catch {
      // keep first-pass URL if refine fails
    }
  }

  // Private album spec: outputs are PREVIEW only until explicit Keep.
  // Do not insert into generations here — that happens on POST /api/library (Keep).
  const prompt = `${sceneId} | ${sceneName} (${who})`;
  const items: { url: string; path: string | null; id: string | null }[] = [];

  for (let i = 0; i < urls.length; i++) {
    let itemUrl = urls[i];
    let path: string | null = null;
    try {
      const img = await fetch(itemUrl);
      const bytes = await img.arrayBuffer();
      // preview prefix — not listed in album until Keep
      path = `${studioId}/preview/${Date.now()}-${i}.jpg`;
      await supabase.storage.from("library").upload(path, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(path, 60 * 60 * 24); // 24h preview TTL intent
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

  return NextResponse.json({
    url: items[0]?.url || null,
    path: items[0]?.path || null,
    id: null,
    kind,
    prompt,
    saved: false,
    status: "preview",
    versions: items.length,
    items,
  });
}
