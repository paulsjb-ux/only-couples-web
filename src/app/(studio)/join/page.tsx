"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");

  async function join() {
    const supabase = createClient();
    const { error } = await supabase.rpc("join_studio", { code });
    if (error) {
      setNote(error.message);
      return;
    }
    setNote("You’re in. Go to People or Library.");
  }

  return (
    <div>
      <div className="hero mb-8">
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          Join a studio
        </h1>
        <p className="text-white/90 text-sm">Enter the code your partner sent you.</p>
      </div>
      <div className="max-w-md space-y-4">
        <input
          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3"
          placeholder="COUPLE-XXXXXXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn btn-primary" onClick={join}>
          Join
        </button>
        {note && <p className="text-sm">{note}</p>}
      </div>
    </div>
  );
}