import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createDirectClient } from "@supabase/supabase-js";

async function studioOf() {
  const cookieClient = await createClient();

  // getUser() verifies the JWT with Supabase Auth. Do not trust getSession()
  // alone for identity decisions on the server.
  const { data: userData, error: userError } = await cookieClient.auth.getUser();
  if (userError || !userData.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Re-use the verified browser session token explicitly for PostgREST/Storage.
  // This avoids a server-cookie handoff edge case where auth.getUser() succeeds
  // but subsequent RLS queries are sent without the user's bearer token.
  const { data: sessionData } = await cookieClient.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    return { error: NextResponse.json({ error: "Session unavailable" }, { status: 401 }) };
  }

  const supabase = createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data: memberships, error: membershipError } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userData.user.id)
    .limit(1);

  if (membershipError) {
    console.error("studio membership lookup failed", membershipError);
    return {
      error: NextResponse.json(
        { error: "Could not load studio membership" },
        { status: 500 }
      ),
    };
  }

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
    .eq("status", "kept")
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

  const items = await Promise.all(
    (data || []).map(async (row) => {
      let url = row.result_url as string | null;
      let path = (row.storage_path as string | null) || null;

      if (!path && url) {
        const m = String(url).match(/\/object\/(?:sign|public)\/library\/([^?]+)/);
        if (m?.[1]) path = decodeURIComponent(m[1]);
      }

      if (path) {
        const candidates = [
          path,
          path.includes("/preview/") ? path.replace("/preview/", "/kept/") : null,
          path.includes("/kept/") ? path.replace("/kept/", "/preview/") : null,
        ].filter(Boolean) as string[];

        for (const candidate of candidates) {
          try {
            const { data: signed, error: sErr } = await supabase.storage
              .from("library")
              .createSignedUrl(candidate, 60 * 60 * 6);
            if (!sErr && signed?.signedUrl) {
              url = signed.signedUrl;
              path = candidate;
              break;
            }
          } catch {
            // One bad object must not fail the whole album.
          }
        }
      }

      return { ...row, result_url: url, storage_path: path };
    })
  );

  return NextResponse.json({ items });
}

/**
 * POST — Keep: always store a durable file under {studio}/kept/
 * Body: { id?, url, path?, kind?, prompt? }
 */
export async function POST(req: NextRequest) {
  const ctx = await studioOf();
  if (ctx.error) return ctx.error;
  const { supabase, studioId } = ctx;

  const body = await req.json().catch(() => ({}));
  const url = body.url ? String(body.url) : "";
  const sourceId = body.id ? String(body.id) : null;
  let path = body.path ? String(body.path) : null;
  const kind = String(body.kind || "image");
  const prompt = String(body.prompt || "");

  if (!url && !path) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  if (path && !path.startsWith(studioId + "/")) {
    return NextResponse.json({ error: "Invalid library path" }, { status: 403 });
  }

  if (sourceId) {
    const { data: source, error: sourceError } = await supabase
      .from("generations")
      .select("id,status,storage_path,result_url")
      .eq("id", sourceId)
      .eq("studio_id", studioId)
      .maybeSingle();
    if (sourceError || !source) {
      return NextResponse.json({ error: "Preview not found" }, { status: 404 });
    }
    path = source.storage_path || path;
    if (path && !path.startsWith(studioId + "/")) {
      return NextResponse.json({ error: "Invalid preview path" }, { status: 403 });
    }
    if (source.status === "kept") {
      let existingUrl = source.result_url || url;
      if (path) {
        const { data: signed } = await supabase.storage.from("library").createSignedUrl(path, 60 * 60 * 24 * 30);
        if (signed?.signedUrl) existingUrl = signed.signedUrl;
      }
      return NextResponse.json({ ok: true, id: source.id, path, url: existingUrl, alreadyKept: true });
    }
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
          await supabase.storage.from("library").remove([path]);
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
      return NextResponse.json(
        { error: "The image could not be stored permanently. Please try Keep again." },
        { status: 502 }
      );
    }
  }

  if (!storagePath) {
    return NextResponse.json(
      { error: "The image could not be stored permanently. Please try Keep again." },
      { status: 502 }
    );
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

  const mutation = sourceId
    ? supabase
        .from("generations")
        .update(row)
        .eq("id", sourceId)
        .eq("studio_id", studioId)
        .select("id")
        .single()
    : supabase.from("generations").insert(row).select("id").single();

  const { data, error } = await mutation;
  if (error) {
    console.error("keep row mutation failed", error);
    return NextResponse.json({ error: "The image was stored but could not be added to Library." }, { status: 500 });
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
    const { error } = await supabase
      .from("generations")
      .delete()
      .eq("id", id)
      .eq("studio_id", studioId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (path && path.startsWith(`${studioId}/`)) {
    const { error } = await supabase.storage.from("library").remove([path]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
