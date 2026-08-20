import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const wanted = who === "wife" ? ["wife"] : who === "husband" ? ["husband"] : ["wife", "husband"];
  const refs = (people || []).filter((p: any) => wanted.includes(p.role) && p.photo_path);

  const assetIds: string[] = [];
  for (const person of refs) {
    const { data: file, error } = await supabase.storage.from("people").download(person.photo_path);
    if (error || !file) continue;
    const bytes = await file.arrayBuffer();
    assetIds.push(await zenUpload(key, bytes, `${person.role}.jpg`));
  }

  const prompt = `Photorealistic intimate adult scene: ${sceneName}. Keep the exact faces from the reference photos. Tasteful, cinematic lighting, high detail.`;

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
      if (["succeeded", "completed", "complete", "success", "done", "partial"].includes(status)) {
        const extra = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        const extraJson = await extra.json().catch(() => ({}));
        url = extractUrl(extraJson) || extractUrl(polled);
        if (url) break;
      }
      if (["failed", "error", "cancelled"].includes(status)) {
        return NextResponse.json({ error: polled.error || polled.message || "Generation failed" }, { status: 500 });
      }
    }
  }

  if (!url) {
    return NextResponse.json({ error: "Timed out waiting for the image" }, { status: 504 });
  }

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

  await supabase.from("generations").insert({
    studio_id: studioId,
    kind,
    prompt: `${body.sceneId || ""} | ${sceneName} (${who})`,
    result_url: url,
  });

  return NextResponse.json({ url });
}