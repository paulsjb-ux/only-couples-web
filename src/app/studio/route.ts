import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/studio
 * Creates a studio + membership for the current user if they don't have one yet.
 * Body: { name?: string }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const userId = userData.user.id;
  const body = await req.json().catch(() => ({}));
  const name =
    (typeof body.name === "string" && body.name.trim()) ||
    (userData.user.user_metadata?.studio_name as string) ||
    "Our Studio";

  // Already a member?
  const { data: existing } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userId)
    .limit(1);

  if (existing?.[0]?.studio_id) {
    return NextResponse.json({
      ok: true,
      studio_id: existing[0].studio_id,
      already: true,
    });
  }

  // Create studio
  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .insert({
      name,
      created_by: userId,
    })
    .select("id")
    .single();

  if (studioError || !studio) {
    // Fallback: some schemas use owner_id instead of created_by
    const { data: studio2, error: err2 } = await supabase
      .from("studios")
      .insert({
        name,
        owner_id: userId,
      })
      .select("id")
      .single();

    if (err2 || !studio2) {
      return NextResponse.json(
        {
          error:
            studioError?.message ||
            err2?.message ||
            "Could not create studio. Check that the studios table exists and RLS allows inserts.",
        },
        { status: 500 }
      );
    }

    const { error: memErr } = await supabase.from("studio_members").insert({
      studio_id: studio2.id,
      user_id: userId,
      role: "owner",
    });

    if (memErr) {
      return NextResponse.json({ error: memErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, studio_id: studio2.id });
  }

  const { error: memberError } = await supabase.from("studio_members").insert({
    studio_id: studio.id,
    user_id: userId,
    role: "owner",
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, studio_id: studio.id });
}

/**
 * GET /api/studio
 * Returns the current user's studio (or 404).
 */
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const { data: memberships } = await supabase
    .from("studio_members")
    .select("studio_id, role")
    .eq("user_id", userData.user.id)
    .limit(1);

  const studioId = memberships?.[0]?.studio_id;
  if (!studioId) {
    return NextResponse.json({ error: "No studio" }, { status: 404 });
  }

  const { data: studio } = await supabase
    .from("studios")
    .select("*")
    .eq("id", studioId)
    .single();

  return NextResponse.json({
    studio_id: studioId,
    role: memberships?.[0]?.role,
    studio,
  });
}
