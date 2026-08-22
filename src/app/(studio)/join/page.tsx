"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const invite = code.trim().toUpperCase();
    if (!invite) {
      setError("Enter the invite code your partner shared.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("Please log in first.");
        setLoading(false);
        return;
      }

      // Look up invite by code (expects table: studio_invites with columns code, studio_id, used_at)
      const { data: inviteRow, error: inviteErr } = await supabase
        .from("studio_invites")
        .select("id, studio_id, used_at")
        .eq("code", invite)
        .maybeSingle();

      if (inviteErr) {
        setError(
          inviteErr.message.includes("does not exist")
            ? "Invite system not set up yet. Ask your partner to share studio access another way, or run the studio_invites migration."
            : inviteErr.message
        );
        setLoading(false);
        return;
      }

      if (!inviteRow) {
        setError("That invite code was not found.");
        setLoading(false);
        return;
      }

      if (inviteRow.used_at) {
        setError("This invite has already been used.");
        setLoading(false);
        return;
      }

      // Already in a studio?
      const { data: existing } = await supabase
        .from("studio_members")
        .select("studio_id")
        .eq("user_id", userData.user.id)
        .limit(1);

      if (existing?.[0]?.studio_id) {
        setError("You already belong to a studio. Leave it first if you need to join another.");
        setLoading(false);
        return;
      }

      const { error: memErr } = await supabase.from("studio_members").insert({
        studio_id: inviteRow.studio_id,
        user_id: userData.user.id,
        role: "partner",
      });

      if (memErr) {
        setError(memErr.message);
        setLoading(false);
        return;
      }

      // Mark invite used (best-effort)
      await supabase
        .from("studio_invites")
        .update({ used_at: new Date().toISOString(), used_by: userData.user.id })
        .eq("id", inviteRow.id);

      setMessage("You're in. Welcome to the studio.");
      setTimeout(() => {
        router.push("/home");
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function createInvite() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError("Please log in first.");
        return;
      }

      const { data: memberships } = await supabase
        .from("studio_members")
        .select("studio_id, role")
        .eq("user_id", userData.user.id)
        .limit(1);

      const studioId = memberships?.[0]?.studio_id;
      if (!studioId) {
        setError("No studio found. Create one first from signup.");
        return;
      }

      // Simple 8-char code
      const newCode = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
        .slice(0, 8);

      const { error: insErr } = await supabase.from("studio_invites").insert({
        studio_id: studioId,
        code: newCode,
        created_by: userData.user.id,
      });

      if (insErr) {
        setError(
          insErr.message.includes("does not exist")
            ? "Invite table not set up. Create a studio_invites table (code, studio_id, created_by, used_at) in Supabase."
            : insErr.message
        );
        return;
      }

      setCode(newCode);
      setMessage(`Share this code with your partner: ${newCode}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1 text-white"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Join your partner
        </h1>
        <p className="text-white/90 text-sm max-w-lg">
          Both of you share one private studio. Create an invite code, or enter the one they sent you.
        </p>
      </div>

      <div className="grid gap-6 max-w-lg">
        <div className="card p-5">
          <div className="section-kicker">Enter invite code</div>
          <form onSubmit={handleJoin} className="space-y-4 mt-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3D4"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 tracking-widest uppercase focus:border-[var(--accent)] focus:outline-none"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-60"
            >
              {loading ? "Joining…" : "Join studio"}
            </button>
          </form>
        </div>

        <div className="card p-5">
          <div className="section-kicker">Invite your partner</div>
          <p className="text-sm text-[var(--muted)] mb-4">
            Generate a one-time code. Share it privately — anyone with the code can join this studio.
          </p>
          <button
            type="button"
            onClick={createInvite}
            disabled={loading}
            className="btn btn-secondary w-full disabled:opacity-60"
          >
            {loading ? "Working…" : "Create invite code"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
