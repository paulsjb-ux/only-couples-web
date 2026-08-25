/**
 * /api/generate — two-tier engine support
 *
 * Env vars required:
 *   WIRO_API_KEY          = your Wiro key
 *   ZENCREATOR_API_KEY    = your ZenCreator key
 *
 * Body:
 *   {
 *     sceneId, faceDescription?, outfitDescription?, role?,
 *     engine?: "seedream-uncensored" | "flux-klein-nsfw" | "sdxl",
 *     // any extra fields you already send
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { buildScenePrompt } from "@/lib/scene-cores";
import { resolveEngine, type EngineId } from "@/lib/engines";

const WIRO_URL = "https://api.wiro.ai/v1/generate";
const ZC_BASE = "https://api.zencreator.pro/api/public/v1";

async function generateWiro(prompt: string, negative: string) {
  const key = process.env.WIRO_API_KEY;
  if (!key) throw new Error("WIRO_API_KEY is not set");

  const res = await fetch(WIRO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "seedream-5-lite-uncensored",
      prompt,
      negative_prompt: negative,
      width: 1024,
      height: 1536, // portrait-friendly for After Dark
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wiro error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // Adapt to whatever shape Wiro returns (url / images[0].url / etc.)
  const url =
    data.url ||
    data.image_url ||
    data.images?.[0]?.url ||
    data.data?.url ||
    data.output?.url;

  if (!url) throw new Error("Wiro response missing image URL");
  return { url, provider: "wiro", raw: data };
}

async function generateZenCreator(
  prompt: string,
  negative: string,
  engine: EngineId
) {
  const key = process.env.ZENCREATOR_API_KEY;
  if (!key) throw new Error("ZENCREATOR_API_KEY is not set");

  // Map our engine id → ZenCreator model / tool name
  // Adjust these strings to the exact names shown in your ZenCreator dashboard / docs
  const modelMap: Record<string, string> = {
    "flux-klein-nsfw": "flux_klein_nsfw", // or "Flux Klein Spicy" / exact tool id
    sdxl: "sdxl",
  };
  const model = modelMap[engine] || "flux_klein_nsfw";

  // 1. Start generation (async)
  const startRes = await fetch(`${ZC_BASE}/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tool: "by_prompt", // or the exact tool name ZenCreator expects
      input: {
        positive_prompt: prompt,
        negative_prompt: negative,
        model, // if the API accepts a model field
        // ratio / resolution if supported
      },
    }),
  });

  if (!startRes.ok) {
    const text = await startRes.text();
    throw new Error(`ZenCreator start error ${startRes.status}: ${text}`);
  }

  const startData = await startRes.json();
  const taskId = startData.id || startData.task_id || startData.data?.id;
  if (!taskId) throw new Error("ZenCreator did not return a task id");

  // 2. Poll until complete (simple loop — improve with timeout in production)
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(`${ZC_BASE}/generations/${taskId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!statusRes.ok) continue;

    const statusData = await statusRes.json();
    const status = statusData.status || statusData.state || statusData.data?.status;

    if (status === "completed" || status === "succeeded" || status === "done") {
      const url =
        statusData.output?.url ||
        statusData.result?.url ||
        statusData.images?.[0]?.url ||
        statusData.data?.url ||
        statusData.url;
      if (!url) throw new Error("ZenCreator completed but no image URL");
      return { url, provider: "zencreator", taskId, raw: statusData };
    }

    if (status === "failed" || status === "error") {
      throw new Error(`ZenCreator generation failed: ${JSON.stringify(statusData)}`);
    }
  }

  throw new Error("ZenCreator generation timed out");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sceneId,
      faceDescription,
      outfitDescription,
      role,
      engine: rawEngine,
      ...rest
    } = body;

    const engine = resolveEngine(rawEngine);
    const { prompt, negative } = buildScenePrompt(
      sceneId,
      faceDescription,
      outfitDescription,
      role
    );

    let result;
    if (engine === "seedream-uncensored") {
      result = await generateWiro(prompt, negative);
    } else {
      result = await generateZenCreator(prompt, negative, engine);
    }

    return NextResponse.json({
      success: true,
      engine,
      imageUrl: result.url,
      provider: result.provider,
      // pass through any extra you need
      ...rest,
    });
  } catch (err: any) {
    console.error("[generate]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Generation failed" },
      { status: 500 }
    );
  }
}
