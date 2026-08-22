import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function studioOf() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    return {
      supabase,
      error: NextResponse.json({ error: "Please log in" }, { status: 401 }),
    };
  const { data: memberships } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userData.user.id)
    .limit(1);
  const studioId = memberships?.[0]?.studio_id as string | undefined;
  if (!studioId)
    return {
      supabase,
      error: NextResponse.json({ error: "No studio" }, { status: 400 }),
    };
  return { supabase, studioId };
}

/**
 * POST — Keep a preview in the private album (generations table).
 * Body: { url, path?, kind?, prompt? }
 */
export async function POST(req: NextRequest) {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  const body = await req.json();
  const url = String(body.url || "");
  const path = body.path ? String(body.path) : null;
  const kind = String(body.kind || "image");
  const prompt = String(body.prompt || "");

  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  // Prefer columns that exist; soft-fail on optional ones if schema differs
  const row: Record<string, unknown> = {
    studio_id: studioId,
    kind,
    prompt,
    result_url: url,
  };
  if (path) row.storage_path = path;
  // status = kept (when column exists)
  row.status = "kept";

  const { data, error } = await supabase
    .from("generations")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    // Retry without optional columns if schema is minimal
    const { data: data2, error: err2 } = await supabase
      .from("generations")
      .insert({
        studio_id: studioId,
        kind,
        prompt,
        result_url: url,
      })
      .select("id")
      .single();

    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data2?.id, path });
  }

  return NextResponse.json({ ok: true, id: data?.id, path });
}

/**
 * DELETE — Remove a kept item (and storage object when path is studio-scoped).
 * Body: { id?, path? }
 */
export async function DELETE(req: NextRequest) {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  const body = await req.json().catch(() => ({}));
  const path = body.path ? String(body.path) : null;
  const id = body.id ? String(body.id) : null;

  if (id) {
    await supabase.from("generations").delete().eq("id", id).eq("studio_id", studioId);
  }

  if (path && path.startsWith(`${studioId}/`)) {
    await supabase.storage.from("library").remove([path]);
  }

  return NextResponse.json({ ok: true });
}
