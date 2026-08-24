import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function studioOf() {
  const supabase = await createClient();
  const { data: userData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !userData.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized — sign in again" },
        { status: 401 }
      ),
    };
  }
  const { data: memberships, error: memErr } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userData.user.id)
    .limit(1);
  if (memErr) {
    return {
      error: NextResponse.json(
        { error: `studio_members: ${memErr.message}` },
        { status: 500 }
      ),
    };
  }
  const studioId = memberships?.[0]?.studio_id as string | undefined;
  if (!studioId) {
    return {
      error: NextResponse.json(
        { error: "No studio — open People or join a studio first" },
        { status: 400 }
      ),
    };
  }
  return { supabase, studioId, userId: userData.user.id };
}

/** GET kept list with re-signed URLs */
export async function GET() {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  const full = await supabase
    .from("generations")
    .select("id, result_url, storage_path, prompt, kind, created_at, status")
    .eq("studio_id", studioId)
    .order("created_at", { ascending: false })
    .limit(80);

  let rows = full.data || [];
  if (full.error) {
    const basic = await supabase
      .from("generations")
      .select("id, result_url, prompt, kind, created_at")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false })
      .limit(80);
    if (basic.error) {
      return NextResponse.json({ error: basic.error.message }, { status: 500 });
    }
    rows = basic.data || [];
  }

  const items = [];
  for (const row of rows) {
    let url = (row as any).result_url as string | null;
    let path = ((row as any).storage_path as string | null) || null;
    if (!path && url) {
      const m = String(url).match(/\/object\/(?:sign|public)\/library\/([^?]+)/);
      if (m?.[1]) path = decodeURIComponent(m[1]);
    }
    if (path) {
      for (const candidate of [
        path,
        path.includes("/preview/") ? path.replace("/preview/", "/kept/") : null,
        path.includes("/kept/") ? path.replace("/kept/", "/preview/") : null,
      ].filter(Boolean) as string[]) {
        const { data: signed } = await supabase.storage
          .from("library")
          .createSignedUrl(candidate, 60 * 60 * 24 * 7);
        if (signed?.signedUrl) {
          url = signed.signedUrl;
          path = candidate;
          break;
        }
      }
    }
    items.push({ ...row, result_url: url, storage_path: path });
  }

  return NextResponse.json({ items });
}

/**
 * POST Keep — always try to put a durable file under {studio}/kept/
 * Body: { url, path?, kind?, prompt?, id? }
 */
export async function POST(req: NextRequest) {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body.url ? String(body.url) : "";
  let path = body.path ? String(body.path) : null;
  const kind = String(body.kind || "image");
  const prompt = String(body.prompt || "");
  const existingId = body.id ? String(body.id) : null;

  if (!url && !path) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const keptPath = `${studioId}/kept/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  let storagePath: string | null = null;
  let finalUrl = url;
  const errors: string[] = [];

  // A) Copy preview → kept
  if (path) {
    try {
      if (path.includes("/preview/")) {
        const dest = path.replace("/preview/", "/kept/");
        const { error: copyErr } = await supabase.storage
          .from("library")
          .copy(path, dest);
        if (!copyErr) storagePath = dest;
        else errors.push(`copy: ${copyErr.message}`);
      } else if (path.startsWith(`${studioId}/`)) {
        storagePath = path;
      }
    } catch (e: any) {
      errors.push(`copy: ${e?.message || e}`);
    }
  }

  // B) Download URL and upload (server-side — no CORS)
  if (!storagePath && url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`fetch image ${res.status}`);
      const bytes = await res.arrayBuffer();
      if (!bytes.byteLength) throw new Error("empty image body");
      const { error: upErr } = await supabase.storage
        .from("library")
        .upload(keptPath, bytes, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      storagePath = keptPath;
    } catch (e: any) {
      errors.push(`upload: ${e?.message || e}`);
    }
  }

  // C) Sign
  if (storagePath) {
    const { data: signed, error: signErr } = await supabase.storage
      .from("library")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 30);
    if (signed?.signedUrl) finalUrl = signed.signedUrl;
    else if (signErr) errors.push(`sign: ${signErr.message}`);
  }

  if (!finalUrl) {
    return NextResponse.json(
      {
        error: "Could not store image. Check Storage bucket 'library' policies.",
        details: errors,
      },
      { status: 500 }
    );
  }

  // D) Update existing preview row OR insert
  if (existingId) {
    const patch: Record<string, unknown> = {
      result_url: finalUrl,
      status: "kept",
    };
    if (storagePath) patch.storage_path = storagePath;
    const { error: upErr } = await supabase
      .from("generations")
      .update(patch)
      .eq("id", existingId)
      .eq("studio_id", studioId);
    if (!upErr) {
      return NextResponse.json({
        ok: true,
        id: existingId,
        path: storagePath,
        url: finalUrl,
      });
    }
    errors.push(`update: ${upErr.message}`);
  }

  const row: Record<string, unknown> = {
    studio_id: studioId,
    kind,
    prompt,
    result_url: finalUrl,
    status: "kept",
  };
  if (storagePath) row.storage_path = storagePath;

  const { data, error } = await supabase
    .from("generations")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    // Minimal insert (no status / storage_path)
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
    if (err2) {
      return NextResponse.json(
        {
          error: err2.message,
          details: errors,
          hint: "Add columns storage_path text, status text on generations; fix RLS insert policy",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      id: data2?.id,
      path: storagePath,
      url: finalUrl,
      warning: "Inserted without storage_path/status columns",
      details: errors,
    });
  }

  return NextResponse.json({
    ok: true,
    id: data?.id,
    path: storagePath,
    url: finalUrl,
    details: errors.length ? errors : undefined,
  });
}

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
