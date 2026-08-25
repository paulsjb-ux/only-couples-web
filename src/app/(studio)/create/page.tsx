"use client";

/**
 * FULL REPLACE for src/app/(studio)/create/page.tsx
 * -------------------------------------------------
 * Do NOT merge. Overwrite the entire file with this.
 * Then keep CreateUploads.tsx in src/components/.
 *
 * After deploy you should see rose pills, NOT grey "Choose File".
 */

import { useState } from "react";
import CreateUploads from "@/components/CreateUploads";

export default function CreatePage() {
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#faf8f6] text-stone-900">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white">
        <button
          type="button"
          className="h-10 w-10 rounded-xl bg-[#6b3a42] text-white flex items-center justify-center"
          aria-label="Menu"
        >
          ☰
        </button>
        <h1 className="flex-1 text-center font-serif text-lg tracking-wide">
          The Other Room
        </h1>
        <div className="w-10" />
      </header>

      <main className="px-4 py-8 flex flex-col items-stretch max-w-lg mx-auto gap-6">
        <CreateUploads
          onFaceSelect={(file) => {
            setFaceFile(file);
            setError(null);
          }}
          onOutfitSelect={(file) => {
            setOutfitFile(file);
            setError(null);
          }}
          onGenerate={async (role) => {
            setError(null);
            setResultUrl(null);

            // Wire to your real API when ready:
            // const body = { role, sceneId: "...", ... };
            // const res = await fetch("/api/generate", { method: "POST", ... });

            // Temporary: simulate success so UI can be verified
            await new Promise((r) => setTimeout(r, 2500));
            console.log("Generate", { role, faceFile: faceFile?.name, outfitFile: outfitFile?.name });
          }}
        />

        {faceFile && (
          <p className="text-xs text-stone-500">Face: {faceFile.name}</p>
        )}
        {outfitFile && (
          <p className="text-xs text-stone-500">Outfit: {outfitFile.name}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {resultUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resultUrl} alt="Result" className="rounded-xl w-full" />
        )}
      </main>
    </div>
  );
}
