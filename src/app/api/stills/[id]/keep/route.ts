import { NextResponse } from "next/server";
import { requireStudioMember } from "@/lib/auth-studio";
import { albumStore } from "@/lib/album-store";
import type { KeepBody } from "@/types/album";

/**
 * POST /api/stills/:id/keep
 * Body: { albumId?: string, visibility?: "both" | "hidden_from_partner" }
 *
 * Moves preview → kept. Defaults to Soft album.
 * Previews never appear in album lists until this succeeds.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const auth = await requireStudioMember(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const still = await albumStore.getStill(id);
  if (!still) {
    return NextResponse.json({ error: "Still not found" }, { status: 404 });
  }
  if (still.studioId !== auth.studio.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: KeepBody = {};
  try {
    body = (await request.json()) as KeepBody;
  } catch {
    body = {};
  }

  const result = await albumStore.keepStill(id, auth.userId, body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    still: result,
    message: "Kept in private album",
  });
}
