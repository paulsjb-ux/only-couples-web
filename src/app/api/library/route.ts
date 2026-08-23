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

  // Promote preview → kept path so Library can re-sign durable URLs
  let storagePath = path;
  let finalUrl = url;
  if (path && path.includes("/preview/")) {
    const keptPath = path.replace("/preview/", "/kept/");
    try {
      await supabase.storage.from("library").copy(path, keptPath);
      storagePath = keptPath;
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(keptPath, 60 * 60 * 24 * 30);
      if (signed?.signedUrl) finalUrl = signed.signedUrl;
    } catch {
      // keep original path/url
    }
  } else if (path) {
    try {
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(path, 60 * 60 * 24 * 30);
      if (signed?.signedUrl) finalUrl = signed.signedUrl;
    } catch {
      /* */
    }
  }

  const row: Record<string, unknown> = {
    studio_id: studioId,
    kind,
    prompt,
    result_url: finalUrl,
  };
  if (storagePath) row.storage_path = storagePath;
  row.status = "kept";

  const { data, error } = await supabase
    .from("generations")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    const { data: data2, error: err2 } = await supabase
      .from("generations")
      .insert({
        studio_id: studioId,
        kind,
        prompt,
        result_url: finalUrl,
      })
      .select("id")
      .single();

    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data2?.id, path: storagePath, url: finalUrl });
  }

  return NextResponse.json({ ok: true, id: data?.id, path: storagePath, url: finalUrl });
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
