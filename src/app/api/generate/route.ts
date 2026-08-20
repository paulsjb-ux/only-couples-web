import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSceneCore } from "@/lib/scene-cores";

const ZEN_BASE = "https://api.zencreator.pro/api/public/v1";

function extractUrl(payload: any): string | null {
  if (!payload || typeof payload !== "object") return null;
  const bags = [payload, payload.data, payload.result, payload.data?.result, payload.output];
  for (const bag of bags) {
    if (!bag || typeof bag !== "object") continue;
    if (typeof bag.url === "string" && bag.url.startsWith("http")) return bag.url;
    if (typeof bag.download_url === "string") return bag.download_url;
    if (typeof bag.image_url === "string") return bag.image_url;
    for (const key of ["outputs", "images", "results", "files"]) {
      const arr = bag[key];
      if (Array.isArray(arr) && arr[0]) {
        if (typeof arr[0] === "string" && arr[0].startsWith("http")) return arr[0];
        if (arr[0]?.url) return arr[0].url;
        if (arr[0]?.download_url) return arr[0].download_url;
      }
    }
  }
  return null;
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
      ? "exactly one penis, attached only to the man, never attached to a woman, never coming from a chest or breasts, never floating"
      : `exactly ${men} penises, one attached to each man, none attached to a woman, no extra or anonymous shafts, no floating genitals`;

  return [
    "ANATOMY LOCK:",
    "correct adult human anatomy only.",
    `exactly ${total} people, no extra people.`,
    penisRule,
    "no extra limbs, no extra hands, no fused bodies, no body parts on the wrong person.",
  ].join(" ");
}

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

  // 1) Scene core from catalog
  let core = getSceneCore(sceneId, sceneName);
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

  const prompt = [whoLine, faceLock, bodyLock, anatomy, core, look].filter(Boolean).join(" ");

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
    return NextResponse.json(
      { error: submitted.error?.message || submitted.message || `Zen error ${submit.status}` },
      { status: 500 }
    );
  }

  let url = extractUrl(submitted);
  const genId = submitted.id || submitted.generation_id || submitted.data?.id;

  if (!url && genId) {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      const polled = await poll.json().catch(() => ({}));
      const status = String(polled.status || polled.state || "").toLowerCase();
      url = extractUrl(polled);
      if (!url) {
        try {
          const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
            headers: { Authorization: `Bearer ${key}` },
          });
          const resultBody = await resultRes.json().catch(() => ({}));
          url = extractUrl(resultBody);
        } catch {
          // ignore
        }
      }
      if (url) break;
      if (["failed", "error", "cancelled"].includes(status)) {
        return NextResponse.json(
          { error: polled.error || polled.message || "Generation failed" },
          { status: 500 }
        );
      }
    }
  }

  if (!url) {
    return NextResponse.json({ error: "Timed out waiting for the image" }, { status: 504 });
  }

  try {
    const img = await fetch(url);
    const bytes = await img.arrayBuffer();
    const path = `${studioId}/${Date.now()}.jpg`;
    await supabase.storage.from("library").upload(path, bytes, {
      contentType: "image/jpeg",
      upsert: true,
    });
    const { data: signed } = await supabase.storage
      .from("library")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signed?.signedUrl) url = signed.signedUrl;
  } catch {
    // keep Zen URL
  }

  await supabase.from("generations").insert({
    studio_id: studioId,
    kind,
    prompt: `${sceneId} | ${sceneName} (${who})`,
    result_url: url,
  });

  return NextResponse.json({ url });
}
