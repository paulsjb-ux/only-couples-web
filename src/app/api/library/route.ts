import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function studioOf() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const { data: memberships } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userData.user.id)
    .limit(1);
  const studioId = memberships?.[0]?.studio_id as string | undefined;
  if (!studioId) {
    return { error: NextResponse.json({ error: "No studio" }, { status: 400 }) };
  }
  return { supabase, studioId, userId: userData.user.id };
}

/**
 * GET — list kept generations with freshly signed URLs
 */
export async function GET() {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  const { data, error } = await supabase
    .from("generations")
    .select("id, result_url, storage_path, prompt, kind, created_at, status")
    .eq("studio_id", studioId)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    // Column missing fallback
    const basic = await supabase
      .from("generations")
      .select("id, result_url, prompt, kind, created_at")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false })
      .limit(80);
    return NextResponse.json({ items: basic.data || [] });
  }

  const items = [];
  for (const row of data || []) {
    let url = row.result_url as string | null;
    let path = (row.storage_path as string | null) || null;

    // Recover path from signed URL
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
        try {
          const { data: signed, error: sErr } = await supabase.storage
            .from("library")
            .createSignedUrl(candidate, 60 * 60 * 24 * 30);
          if (!sErr && signed?.signedUrl) {
            url = signed.signedUrl;
            path = candidate;
            break;
          }
        } catch {
          /* next */
        }
      }
    }

    items.push({ ...row, result_url: url, storage_path: path });
  }

  return NextResponse.json({ items });
}

/**
 * POST — Keep: always store a durable file under {studio}/kept/
 * Body: { url, path?, kind?, prompt? }
 */
export async function POST(req: NextRequest) {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  const body = await req.json().catch(() => ({}));
  const url = body.url ? String(body.url) : "";
  let path = body.path ? String(body.path) : null;
  const kind = String(body.kind || "image");
  const prompt = String(body.prompt || "");

  if (!url && !path) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const keptPath = `${studioId}/kept/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  let storagePath: string | null = null;
  let finalUrl = url;

  // 1) Prefer copying existing preview object
  if (path) {
    try {
      if (path.includes("/preview/")) {
        const dest = path.replace("/preview/", "/kept/");
        const { error: copyErr } = await supabase.storage.from("library").copy(path, dest);
        if (!copyErr) {
          storagePath = dest;
        }
      } else if (path.includes("/kept/")) {
        storagePath = path;
      } else {
        // unknown path — try copy to kept
        const { error: copyErr } = await supabase.storage.from("library").copy(path, keptPath);
        if (!copyErr) storagePath = keptPath;
      }
    } catch {
      /* fall through to download */
    }
  }

  // 2) If no storage yet, download URL (Zen or signed) and upload into kept/
  if (!storagePath) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const bytes = await res.arrayBuffer();
      const { error: upErr } = await supabase.storage.from("library").upload(keptPath, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (upErr) throw upErr;
      storagePath = keptPath;
    } catch (e) {
      console.error("keep upload failed", e);
      // Last resort: save URL only (will expire) — still insert so row exists
      storagePath = path;
    }
  }

  // 3) Fresh long-lived signed URL
  if (storagePath) {
    try {
      const { data: signed } = await supabase.storage
        .from("library")
        .createSignedUrl(storagePath, 60 * 60 * 24 * 30);
      if (signed?.signedUrl) finalUrl = signed.signedUrl;
    } catch {
      /* keep finalUrl */
    }
  }

  const row: Record<string, unknown> = {
    studio_id: studioId,
    kind,
    prompt,
    result_url: finalUrl,
    status: "kept",
  };
  if (storagePath) row.storage_path = storagePath;

  const { data, error } = await supabase.from("generations").insert(row).select("id").single();

  if (error) {
    // Retry without optional columns
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
    return NextResponse.json({
      ok: true,
      id: data2?.id,
      path: storagePath,
      url: finalUrl,
      warning: "storage_path column missing — add it in Supabase for durable library",
    });
  }

  return NextResponse.json({ ok: true, id: data?.id, path: storagePath, url: finalUrl });
}

/**
 * DELETE — { id?, path? }
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
