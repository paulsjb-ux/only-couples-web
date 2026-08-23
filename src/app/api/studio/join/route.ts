import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/studio/join
 * Body: { code: string } — studio UUID (invite code)
 * Adds the current user as partner member of that studio.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const userId = userData.user.id;
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim();

  if (!code) {
    return NextResponse.json({ error: "Enter an invite code" }, { status: 400 });
  }

  // Already in a studio?
  const { data: existing } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", userId)
    .limit(1);

  if (existing?.[0]?.studio_id) {
    if (existing[0].studio_id === code) {
      return NextResponse.json({
        ok: true,
        studio_id: code,
        already: true,
        message: "You are already in this studio",
      });
    }
    return NextResponse.json(
      {
        error:
          "You already belong to another studio. Log out or use that studio — multi-studio is not enabled yet.",
      },
      { status: 400 }
    );
  }

  // Resolve studio by id (invite code = studio UUID)
  const { data: studio, error: studioErr } = await supabase
    .from("studios")
    .select("id, name")
    .eq("id", code)
    .maybeSingle();

  if (studioErr || !studio) {
    return NextResponse.json(
      { error: "Invite code not found. Ask your partner for the code from Account." },
      { status: 404 }
    );
  }

  const { error: memErr } = await supabase.from("studio_members").insert({
    studio_id: studio.id,
    user_id: userId,
    role: "partner",
  });

  if (memErr) {
    // Unique violation etc.
    return NextResponse.json(
      { error: memErr.message || "Could not join studio" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    studio_id: studio.id,
    name: studio.name,
    message: "Joined studio",
  });
}
