import { NextResponse } from "next/server";
import { requireStudioMember } from "@/lib/auth-studio";
import { albumStore } from "@/lib/album-store";

/**
 * GET /api/albums/:id/stills
 * Returns kept stills only. Never preview or discarded.
 * Hides partner-hidden items from the other member.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const auth = await requireStudioMember(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const album = await albumStore.getAlbum(id);
  if (!album || album.studioId !== auth.studio.id) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }
  if (album.hiddenFor.includes(auth.userId)) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }

  const stills = await albumStore.listKeptStills(id, auth.userId);
  return NextResponse.json({ stills });
}
