"use client";

import { useState, useRef, ChangeEvent } from "react";

/**
 * FULL REPLACE for: src/app/(studio)/create/page.tsx
 * After deploy you should see rose pills, NOT grey "Choose File".
 */
export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [role, setRole] = useState("female-lover");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFaceUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("Face photo selected:", file.name);
  };

  const handleOutfitUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("Outfit photo selected:", file.name);
  };

  const startProgress = () => {
    setProgress(8);
    progressIntervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          return 92;
        }
        return p + Math.floor(Math.random() * 6) + 3;
      });
    }, 400);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    startProgress();
    try {
      // TODO: call /api/generate
      await new Promise((r) => setTimeout(r, 2500));
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto min-h-screen bg-[#faf8f6]">
      {/* Rose pills — native inputs hidden */}
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium">
            Choose face photo
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFaceUpload}
          />
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium">
            Upload outfit photo
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleOutfitUpload}
          />
        </label>
      </div>

      <select
        className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="female-lover">Female lover</option>
        <option value="male-lover">Male lover</option>
        <option value="both">Both</option>
      </select>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium disabled:opacity-60"
      >
        {isGenerating ? "Making…" : "Make"}
      </button>

      {isGenerating && (
        <div className="w-full">
          <div className="text-sm text-rose-700 mb-1">Making… {progress}%</div>
          <div className="h-2 w-full rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
