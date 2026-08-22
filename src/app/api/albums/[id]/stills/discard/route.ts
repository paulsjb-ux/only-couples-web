import { NextResponse } from "next/server";
import { requireStudioMember } from "@/lib/auth-studio";
import { albumStore } from "@/lib/album-store";

/**
 * POST /api/stills/:id/discard
 *
 * Marks still discarded and enqueues storage wipe.
 * Works on preview or kept. Never leaves media in the album.
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

  const result = await albumStore.discardStill(id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    still: result,
    message: "Removed from album and storage wipe queued",
  });
}
