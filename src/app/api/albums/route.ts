import { NextResponse } from "next/server";
import { requireStudioMember } from "@/lib/auth-studio";
import { albumStore } from "@/lib/album-store";

/**
 * GET /api/albums — list albums visible to the current member
 * POST /api/albums — create custom album (optional MVP)
 */
export async function GET(request: Request) {
  const auth = await requireStudioMember(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await albumStore.ensureSoftAlbum(auth.studio.id, auth.userId);
  const list = await albumStore.listAlbumsForStudio(
    auth.studio.id,
    auth.userId
  );
  return NextResponse.json({ albums: list });
}

export async function POST(request: Request) {
  const auth = await requireStudioMember(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Soft album is enough for MVP; custom names later
  const soft = await albumStore.ensureSoftAlbum(auth.studio.id, auth.userId);
  return NextResponse.json({ album: soft }, { status: 201 });
}
