import { NextResponse } from "next/server";
import { requireStudioMember } from "@/lib/auth-studio";
import { albumStore } from "@/lib/album-store";
import type { CreateSceneBody } from "@/types/album";

/**
 * POST /api/scenes
 *
 * Creates a generation job result as PREVIEW only (albumId null).
 * Does not add to any album until POST /api/stills/:id/keep.
 *
 * Hook your real image pipeline where noted.
 */
export async function POST(request: Request) {
  const auth = await requireStudioMember(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateSceneBody = {};
  try {
    body = (await request.json()) as CreateSceneBody;
  } catch {
    body = {};
  }

  const intensity = body.intensity ?? "soft";
  const locationId = body.locationId ?? "bedroom_morning";

  // TODO: build prompt from prompts/locations.json + anatomy-rules + global-negatives
  // TODO: call your image model; upload to private bucket → storageKey
  const storageKey = `previews/${auth.studio.id}/${Date.now()}.jpg`;

  const scene = await albumStore.createScene({
    studioId: auth.studio.id,
    intensity,
    locationId,
    createdBy: auth.userId,
  });

  const still = await albumStore.createPreviewStill({
    sceneId: scene.id,
    studioId: auth.studio.id,
    createdBy: auth.userId,
    storageKey,
  });

  return NextResponse.json(
    {
      scene,
      still,
      message: "Preview ready — Keep to save to private album, or Discard",
    },
    { status: 201 }
  );
}
