"use client";

/**
 * Client-only create UI.
 * Homepage never loads this chunk (dynamic import in page.tsx).
 *
 * Wires CreateUploads (rose pills + progress bar) and passes engine choice
 * through to /api/generate.
 */

import { useState } from "react";
import CreateUploads from "@/components/CreateUploads";
import type { EngineId } from "@/lib/engines";
import { ENGINES } from "@/lib/engines";

export default function CreatePageClient() {
  const [engine, setEngine] = useState<EngineId>("seedream-uncensored");
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto">
      {/* Engine picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-stone-600">Engine</label>
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value as EngineId)}
          className="rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          {(Object.keys(ENGINES) as EngineId[]).map((id) => (
            <option key={id} value={id}>
              {ENGINES[id].label} ({ENGINES[id].costHint})
            </option>
          ))}
        </select>
      </div>

      <CreateUploads
        onFaceSelect={(file) => setFaceFile(file)}
        onOutfitSelect={(file) => setOutfitFile(file)}
        onGenerate={async (role) => {
          // TODO: upload face/outfit if needed, then:
          const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sceneId: "spread-open", // replace with your selected scene
              role,
              engine,
              // faceDescription / outfitDescription if you extract them
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Generation failed");
          }
          // handle result (imageUrl) in your real UI
          const data = await res.json();
          console.log("Generated:", data);
        }}
      />
    </div>
  );
}
