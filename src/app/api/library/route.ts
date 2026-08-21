import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function studioOf() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { supabase, error: NextResponse.json({ error: "Please log in" }, { status: 401 }) };
  const { data: memberships } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userData.user.id)
    .limit(1);
  const studioId = memberships?.[0]?.studio_id as string | undefined;
  if (!studioId) return { supabase, error: NextResponse.json({ error: "No studio" }, { status: 400 }) };
  return { supabase, studioId };
}

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

  const { data, error } = await supabase
    .from("generations")
    .insert({
      studio_id: studioId,
      kind,
      prompt,
      result_url: url,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id, path });
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
