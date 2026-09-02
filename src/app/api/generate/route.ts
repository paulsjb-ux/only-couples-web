import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  AVOID_LINE,
  FACE_LOCK,
  GLOBAL_NEGATIVES,
  PHOTO_LOOK,
  VERSION_VARIANTS,
  buildAfterDarkContinuityPrompt,
  buildAfterDarkFluxPrompt,
  buildAnatomyLock,
  buildBodyLock,
  buildLocationGuard,
  buildOutfitEditPrompt,
  buildOutfitLock,
  buildSoloCleanupPrompt,
  buildSoloGuard,
  buildWhoLine,
} from "@/lib/generation-prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

const ZEN_BASE = "https://api.zencreator.pro/api/public/v1";
const ENABLE_AFTER_DARK_FACE_CORRECTION = false;

const IMAGE_MODELS = {
  general: "GENERAL",
  nanoBanana2: "NANO_BANANA_2",
  seedream5: "SEEDREAM_5",
  seedream5Pro: "SEEDREAM_5_PRO",
  qwenImage: "QWEN_IMAGE",
  qwenImagePro: "QWEN_IMAGE_PRO",
  wan27: "WAN_2_7",
  wan27Pro: "WAN_2_7_PRO",
  sdxl: "SDXL",
  fluxKleinNsfw: "FLUX_KLEIN_NSFW",
  fluxKleinLora: "FLUX_KLEIN_LORA",
} as const;

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

export async function POST(req: NextRequest) {
  const key = process.env.ZENCREATOR_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing ZENCREATOR_API_KEY in .env.local" }, { status: 500 });
  }
  const zenKey: string = key;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const body = await req.json();
  const sceneName = String(body.sceneName || "erotic couple scene");
  const who = String(body.who || "couple");
  const sceneId = String(body.sceneId || "");
  const versions = Math.min(4, Math.max(1, Number(body.versions) || 1));
  const requestedJobId = typeof body.jobId === "string" ? body.jobId : "";
  const jobId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestedJobId)
    ? requestedJobId
    : crypto.randomUUID();
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

  let sceneMeta: {
    id: string;
    tab: string;
    title: string | null;
    prompt: string;
    cast_count: number | null;
    location: string | null;
    is_solo: boolean;
    prompt_version: number;
    updated_at: string;
  } | null = null;
  if (sceneId) {
    const { data, error } = await supabase
      .from("scenes")
      .select("id,tab,title,prompt,cast_count,location,is_solo,prompt_version,updated_at")
      .eq("id", sceneId)
      .maybeSingle();
    if (error) console.error("Supabase scene metadata lookup failed", error);
    else sceneMeta = data;
  }

  const requestedPeople = who.includes(",")
    ? who.split(",").map((s: string) => s.trim()).filter(Boolean)
    : who === "couple"
      ? ["wife", "husband"]
      : [who].filter(Boolean);

  const isSolo = Boolean(sceneMeta?.is_solo || sceneMeta?.cast_count === 1 || requestedPeople.length === 1);
  const wanted = isSolo ? requestedPeople.slice(0, 1) : requestedPeople;
  const isAfterDark = String(sceneMeta?.tab || "").toLowerCase().replace(/[ -]/g, "") === "afterdark";
  const generationModel = isAfterDark ? "FLUX_KLEIN_NSFW" : "SEEDREAM_5_PRO";
  // Seedream handles three-person identity and anatomy more reliably; Flux remains best for one- and two-person After Dark scenes.
  const shouldApplyAfterDarkFlux = isAfterDark && wanted.length <= 2;
  const maxPersonReferences = isSolo ? 1 : 3;

  const peopleRows = (people || []) as PersonRecord[];
  const castPeople = peopleRows.filter((p) => wanted.includes(p.role || ""));
  castPeople.sort((a, b) => wanted.indexOf(a.role || "") - wanted.indexOf(b.role || ""));
  const refs = castPeople.filter((p) => p.photo_path);

  type PathItem = { role: string; kind: "face" | "body" | "angle"; path: string };
  const chosen: PathItem[] = [];

  for (const person of refs) {
    if (person.photo_path && chosen.length < maxPersonReferences) {
      chosen.push({ role: person.role, kind: "face", path: person.photo_path });
    }
  }

  if (chosen.length < maxPersonReferences) {
    for (const person of refs) {
      if (chosen.length >= maxPersonReferences) break;
      if (person.photo_body) {
        chosen.push({ role: person.role, kind: "body", path: person.photo_body });
      }
    }
  }
  if (chosen.length < maxPersonReferences) {
    for (const person of refs) {
      if (chosen.length >= maxPersonReferences) break;
      if (person.photo_angle) {
        chosen.push({ role: person.role, kind: "angle", path: person.photo_angle });
      }
    }
  }

  const personAssetIds: string[] = [];
  const faceIdentityAssetIds: string[] = [];
  for (const item of chosen) {
    const { data: file, error } = await supabase.storage.from("people").download(item.path);
    if (error || !file) continue;
    const bytes = await file.arrayBuffer();
    const uploadedAsset = await zenUpload(zenKey, bytes, `${item.role}-${item.kind}.jpg`);
    personAssetIds.push(uploadedAsset);
    if (item.kind === "face") faceIdentityAssetIds.push(uploadedAsset);
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
        outfitAssetId = await zenUpload(zenKey, bytes, "outfit-ref.jpg");
        outfitLock = buildOutfitLock(wearer);
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

  let core = sceneMeta?.prompt ? String(sceneMeta.prompt) : "";

  if (sceneId && !core) {
    return NextResponse.json(
      { error: "This scene has no generation prompt configured." },
      { status: 422 }
    );
  }

  if (!core) {
    core = sceneName || (outfitPath ? "Outfit try-on" : "erotic couple scene");
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
  const whoLine = buildWhoLine({
    isSolo,
    labels,
    referenceGuide: refGuide,
    castCount: refs.length,
  });
  const soloGuard = buildSoloGuard(isSolo);
  const faceLock = FACE_LOCK;

  const selectedPeople = peopleRows.filter((p) => wanted.includes(p.role || ""));
  const hasBodyHints = selectedPeople.some(
    (p) => p.age || p.body_shape || p.breasts || p.penis || p.look
  );
  const bodyNotes = selectedPeople.map(bodyLine).join(". ");
  const bodyLock = buildBodyLock(bodyNotes, hasBodyHints);
  const anatomy = buildAnatomyLock(castPeople.length ? castPeople : refs);
  const look = PHOTO_LOOK;
  const locationGuard = buildLocationGuard(sceneMeta?.location);
  const avoidLine = AVOID_LINE;

  // Scene act comes before look so the shot list wins.
  const promptBase = [whoLine, faceLock, anatomy, outfitLock, `SCENE: ${core}`, soloGuard, bodyLock, locationGuard, look, avoidLine]
    .filter(Boolean)
    .join(" ");

  const prompt = `${sceneId} | ${sceneName} (${who})`;
  const { error: jobInsertError } = await supabase.from("generations").insert({
    id: jobId,
    job_id: jobId,
    studio_id: studioId,
    kind: "image",
    prompt,
    status: "processing",
    requested_count: versions,
    completed_count: 0,
  });
  if (jobInsertError) {
    return NextResponse.json(
      { error: "Could not create a durable generation job" },
      { status: 500 }
    );
  }

  async function runLockedEditorPass(
    imageAssets: string[],
    passPrompt: string,
    model: string,
    errorLabel: string
  ): Promise<string | null> {
    const submit = await fetch(`${ZEN_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zenKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "image_editor",
        input: {
          image_assets: imageAssets.slice(0, 3),
          prompt: passPrompt,
          ratio: sceneId === "spicy-cuckold" ? "4:3" : "3:4",
          number_of_images: 1,
          model,
        },
      }),
    });
    const submitted = await submit.json().catch(() => ({}));
    if (!submit.ok) {
      throw new Error(
        submitted.error?.message || submitted.message || `${errorLabel} failed ${submit.status}`
      );
    }

    let urls = extractUrls(submitted);
    const genId = submitted.id || submitted.generation_id || submitted.data?.id;
    if (!urls.length && genId) {
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
          headers: { Authorization: `Bearer ${zenKey}` },
        });
        const polled = await poll.json().catch(() => ({}));
        urls = extractUrls(polled);
        if (!urls.length) {
          try {
            const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
              headers: { Authorization: `Bearer ${zenKey}` },
            });
            urls = extractUrls(await resultRes.json().catch(() => ({})));
          } catch {
            // ignore
          }
        }
        if (urls.length) break;
        const status = String(polled.status || polled.state || "").toLowerCase();
        if (["failed", "error", "cancelled"].includes(status)) {
          throw new Error(polled.error || polled.message || `${errorLabel} failed`);
        }
      }
    }
    return urls[0] || null;
  }

  async function applyAfterDarkFlux(baseUrl: string, scenePrompt: string): Promise<string> {
    try {
      const sourceBytes = await (await fetch(baseUrl)).arrayBuffer();
      const sourceAsset = await zenUpload(zenKey, sourceBytes, "after-dark-locked-base.jpg");
      const identityAssets =
        sceneId === "spicy-cuckold" && faceIdentityAssetIds.length >= 3
          ? faceIdentityAssetIds.slice(1, 3)
          : faceIdentityAssetIds.slice(0, 2);
      const fluxPrompt = buildAfterDarkFluxPrompt(scenePrompt, identityAssets.length > 0);

      const result = await runLockedEditorPass(
        [sourceAsset, ...identityAssets],
        fluxPrompt,
        "FLUX_KLEIN_NSFW",
        "After Dark Flux transform"
      );
      console.info("generation model route", {
        sceneId: sceneId || "free-play",
        sceneTab: sceneMeta?.tab || "none",
        pass: "after_dark_transform",
        requestedModel: "FLUX_KLEIN_NSFW",
        modelUsed: result ? "FLUX_KLEIN_NSFW" : "SEEDREAM_5_PRO",
        usedFallback: !result,
        tool: "image_editor",
      });
      return result || baseUrl;
    } catch (error: unknown) {
      console.warn("After Dark Flux transform failed; using locked base", {
        sceneId: sceneId || "free-play",
        error: errorMessage(error),
      });
      return baseUrl;
    }
  }

  async function restoreAfterDarkContinuity(sourceUrl: string): Promise<string> {
    if (!isAfterDark || !personAssetIds.length) return sourceUrl;
    try {
      const sourceBytes = await (await fetch(sourceUrl)).arrayBuffer();
      const sourceAsset = await zenUpload(zenKey, sourceBytes, "after-dark-final-scene.jpg");
      const identityAssets =
        sceneId === "spicy-cuckold" && faceIdentityAssetIds.length >= 3
          ? faceIdentityAssetIds.slice(1, 3)
          : faceIdentityAssetIds.slice(0, 2);
      const continuityPrompt = buildAfterDarkContinuityPrompt();
      const result = await runLockedEditorPass(
        [sourceAsset, ...identityAssets],
        continuityPrompt,
        "SEEDREAM_5_PRO",
        "After Dark identity correction"
      );
      return result || sourceUrl;
    } catch (error: unknown) {
      console.warn("After Dark identity correction failed; using Flux result", {
        sceneId: sceneId || "free-play",
        error: errorMessage(error),
      });
      return sourceUrl;
    }
  }

  function selectBaseModels(promptText: string): string[] {
    const lowerPrompt = promptText.toLowerCase();
    const complexComposition = /(three people|three-person|multiple people|full body|head to toe|standing|watching|foreground|background|legs|hands|pose)/.test(lowerPrompt);
    const stylizedScene = /(editorial|magazine|stylized|cinematic|fashion|artistic)/.test(lowerPrompt);

    if (isAfterDark) {
      if (wanted.length >= 3) {
        return [IMAGE_MODELS.wan27Pro, IMAGE_MODELS.wan27, IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.seedream5];
      }
      return assetIds.length
        ? [IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.seedream5]
        : [IMAGE_MODELS.fluxKleinNsfw, IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.seedream5];
    }

    if (outfitAssetId || isSolo) {
      return [IMAGE_MODELS.nanoBanana2, IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.general];
    }
    if (complexComposition) {
      return [IMAGE_MODELS.wan27Pro, IMAGE_MODELS.wan27, IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.qwenImagePro];
    }
    if (stylizedScene) {
      return [IMAGE_MODELS.qwenImagePro, IMAGE_MODELS.qwenImage, IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.general];
    }
    if (hasBodyHints) {
      return [IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.sdxl, IMAGE_MODELS.wan27Pro, IMAGE_MODELS.general];
    }
    return [IMAGE_MODELS.general, IMAGE_MODELS.seedream5Pro, IMAGE_MODELS.qwenImagePro];
  }

  async function runOne(versionIndex: number): Promise<string | null> {
    const variant = VERSION_VARIANTS[versionIndex] || "";
    const prompt = variant ? `${promptBase} ${variant}` : promptBase;
    const tool = assetIds.length ? "image_editor" : "by_prompt";
    const modelCandidates = selectBaseModels(prompt);
    const baseModel = modelCandidates[0] || generationModel;
    // image_editor rejects unknown fields (e.g. negative_prompt).
    // AVOID: stays in the prompt text; only by_prompt gets negative_prompt.
    const input = assetIds.length
      ? {
          image_assets: assetIds.slice(0, 3),
          prompt,
          ratio: sceneId === "spicy-cuckold" ? "4:3" : "3:4",
          number_of_images: 1,
          model: baseModel,
        }
      : {
          positive_prompt: prompt,
          negative_prompt: GLOBAL_NEGATIVES,
          ratio: sceneId === "spicy-cuckold" ? "4:3" : "3:4",
          batch_size: 1,
          model: baseModel,
        };

    let modelUsed = baseModel;
    let usedFallback = false;
    let fluxFailureStatus: number | null = null;
    let fluxFailureCode: string | null = null;
    let fluxFailureType: string | null = null;
    let fluxFailureField: string | null = null;
    let submit: Response | null = null;
    let submitted: Awaited<ReturnType<Response["json"]>> = {};
    for (let candidateIndex = 0; candidateIndex < modelCandidates.length; candidateIndex++) {
      const candidate = modelCandidates[candidateIndex];
      modelUsed = candidate;
      usedFallback = candidateIndex > 0;
      submit = await fetch(ZEN_BASE + "/generations", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + zenKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool, input: { ...input, model: candidate } }),
      });
      submitted = await submit.json().catch(() => ({}));
      if (submit.ok) break;

      const modelError = asRecord(submitted.error);
      const modelDetails = asRecord(modelError?.details);
      fluxFailureStatus = submit.status;
      fluxFailureCode = String(modelError?.code || submitted.code || "") || null;
      fluxFailureType = String(modelError?.type || submitted.type || "") || null;
      fluxFailureField = String(modelError?.field || modelDetails?.field || "") || null;
      if (![400, 403, 404, 422].includes(submit.status)) break;
    }
    if (!submit || !submit.ok) {
      throw new Error(submitted.error?.message || submitted.message || "Zen error " + (submit?.status || "unknown"));
    }
    console.info("generation model route", {
      sceneId: sceneId || "free-play",
      sceneTab: sceneMeta?.tab || "none",
      pass: isAfterDark && assetIds.length ? "identity_scene_base" : "direct",
      requestedModel: baseModel,
      modelUsed,
      usedFallback,
      fluxFailureStatus,
      fluxFailureCode,
      fluxFailureType,
      fluxFailureField,
      tool,
    });

    let urls = extractUrls(submitted);
    const genId = submitted.id || submitted.generation_id || submitted.data?.id;
    if (!urls.length && genId) {
      const maxPolls = 24;
      for (let i = 0; i < maxPolls; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
          headers: { Authorization: `Bearer ${zenKey}` },
        });
        const polled = await poll.json().catch(() => ({}));
        const status = String(polled.status || polled.state || "").toLowerCase();
        urls = extractUrls(polled);
        if (!urls.length) {
          try {
            const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
              headers: { Authorization: `Bearer ${zenKey}` },
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
    const baseUrl = urls[0] || null;
    if (!baseUrl || !shouldApplyAfterDarkFlux || !assetIds.length) return baseUrl;
    return applyAfterDarkFlux(baseUrl, prompt);
  }

  async function applyOutfitToGeneratedImage(sourceUrl: string): Promise<string | null> {
    if (!applyOutfitSecondPass || !outfitAssetId) return sourceUrl;

    const sourceBytes = await (await fetch(sourceUrl)).arrayBuffer();
    const sourceAsset = await zenUpload(zenKey, sourceBytes, "identity-locked-scene.jpg");
    const prompt = buildOutfitEditPrompt(wearer);

    const submit = await fetch(`${ZEN_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zenKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "image_editor",
        input: {
          image_assets: [sourceAsset, outfitAssetId],
          prompt,
          ratio: sceneId === "spicy-cuckold" ? "4:3" : "3:4",
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
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
          headers: { Authorization: `Bearer ${zenKey}` },
        });
        const polled = await poll.json().catch(() => ({}));
        urls = extractUrls(polled);
        if (!urls.length) {
          try {
            const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
              headers: { Authorization: `Bearer ${zenKey}` },
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

  async function enforceSoloGeneratedImage(sourceUrl: string): Promise<string | null> {
    if (!isSolo) return sourceUrl;

    const sourceBytes = await (await fetch(sourceUrl)).arrayBuffer();
    const sourceAsset = await zenUpload(zenKey, sourceBytes, "solo-scene-with-extra-person.jpg");
    const identityAsset = personAssetIds[0];
    const imageAssets = identityAsset ? [sourceAsset, identityAsset] : [sourceAsset];
    const subject = labels[0] || "the selected subject";
    const prompt = buildSoloCleanupPrompt(subject, Boolean(identityAsset));

    const submit = await fetch(`${ZEN_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zenKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "image_editor",
        input: {
          image_assets: imageAssets,
          prompt,
          ratio: sceneId === "spicy-cuckold" ? "4:3" : "3:4",
          number_of_images: 1,
          model: "SEEDREAM_5_PRO",
        },
      }),
    });

    const submitted = await submit.json().catch(() => ({}));
    if (!submit.ok) {
      throw new Error(submitted.error?.message || submitted.message || `Solo cleanup failed ${submit.status}`);
    }

    let urls = extractUrls(submitted);
    const genId = submitted.id || submitted.generation_id || submitted.data?.id;
    if (!urls.length && genId) {
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const poll = await fetch(`${ZEN_BASE}/generations/${genId}`, {
          headers: { Authorization: `Bearer ${zenKey}` },
        });
        const polled = await poll.json().catch(() => ({}));
        urls = extractUrls(polled);
        if (!urls.length) {
          try {
            const resultRes = await fetch(`${ZEN_BASE}/generations/${genId}/result`, {
              headers: { Authorization: `Bearer ${zenKey}` },
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

  const results = await Promise.all(Array.from({ length: versions }, async (_, i) => {
    try {
      const firstPass = await runOne(i);
      if (firstPass) {
        const outfitUrl = applyOutfitSecondPass ? await applyOutfitToGeneratedImage(firstPass) : firstPass;
        const cleanedUrl = outfitUrl && isSolo ? await enforceSoloGeneratedImage(outfitUrl) : outfitUrl;
        const finalUrl =
          cleanedUrl && ENABLE_AFTER_DARK_FACE_CORRECTION
            ? await restoreAfterDarkContinuity(cleanedUrl)
            : cleanedUrl;
        return finalUrl
          ? { index: i, url: finalUrl, error: null }
          : { index: i, url: null, error: `v${i + 1}: final pass returned no url` };
      }
      return { index: i, url: null, error: `v${i + 1}: no url` };
    } catch (error: unknown) {
      return { index: i, url: null, error: `v${i + 1}: ${errorMessage(error)}` };
    }
  }));
  results.sort((a, b) => a.index - b.index);
  const urls = results.flatMap((result) => result.url ? [result.url] : []);
  const errors = results.flatMap((result) => result.error ? [result.error] : []);

  if (!urls.length) {
    const msg = errors[0] || "Timed out waiting for the image";
    await supabase
      .from("generations")
      .update({ status: "failed", completed_count: 0 })
      .eq("id", jobId)
      .eq("studio_id", studioId);
    return NextResponse.json({ error: msg, details: errors }, { status: 504 });
  }

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
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const it = items[itemIndex];
    let id: string | null = null;
    if (it.path || it.url) {
      try {
        const row: Record<string, unknown> = {
          job_id: jobId,
          studio_id: studioId,
          kind: "image",
          prompt,
          result_url: it.url,
          status: "preview",
          requested_count: versions,
          completed_count: items.length,
        };
        if (it.path) row.storage_path = it.path;
        const mutation = itemIndex === 0
          ? supabase.from("generations").update(row).eq("id", jobId).eq("studio_id", studioId)
          : supabase.from("generations").insert(row);
        const { data: ins } = await mutation.select("id").single();
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
    kind: "image",
    jobId,
    prompt,
    saved: false,
    status: "preview",
    versions: itemsOut.length,
    items: itemsOut,
  });
}
