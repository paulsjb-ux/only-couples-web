import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { data: rows, error: rowsError } = await supabase
    .from("outfits")
    .select("id,slug,name,category,storage_path")
    .eq("active", true)
    .order("category")
    .order("sort_order");
  if (rowsError) return NextResponse.json({ error: rowsError.message }, { status: 500 });

  const results: Array<{ name: string; path: string; ok: boolean; error?: string }> = [];
  for (const row of rows || []) {
    try {
      const localFile = path.join(process.cwd(), "public", "outfits", row.category, `${row.slug}.jpg`);
      const bytes = await readFile(localFile);
      const { error } = await supabase.storage.from("outfits").upload(row.storage_path, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
      if (error) throw error;
      results.push({ name: row.name, path: row.storage_path, ok: true });
    } catch (e) {
      results.push({ name: row.name, path: row.storage_path, ok: false, error: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  const uploaded = results.filter((r) => r.ok).length;
  return NextResponse.json({ uploaded, total: results.length, results }, { status: uploaded === results.length ? 200 : 207 });
}
