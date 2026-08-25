// Relevant UI + progress sections for The Other Room create page
// Integrate these patterns into your existing page.tsx.
// This file is a self-contained, compilable reference implementation.

"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [role, setRole] = useState("female-lover");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFaceUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: wire to your face upload / identity logic
      console.log("Face photo selected:", file.name);
    }
  };

  const handleOutfitUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: wire to your outfit upload logic
      console.log("Outfit photo selected:", file.name);
    }
  };

  const startProgress = () => {
    setProgress(8);
    progressIntervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          return 92;
        }
        return p + Math.floor(Math.random() * 6) + 3; // ~8 → 92
      });
    }, 400);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    startProgress();

    try {
      // TODO: call your /api/generate endpoint
      // On success:
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      // Keep 100% visible briefly, then reset if desired
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-lg mx-auto">
      {/* Upload buttons — rose primary + outline pills, sr-only native inputs */}
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition">
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
          <span className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition">
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

      {/* Role select — rounded */}
      <select
        className="rounded-full border border-rose-200 bg-cream-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="female-lover">Female lover</option>
        <option value="male-lover">Male lover</option>
        <option value="both">Both</option>
      </select>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isGenerating ? "Making…" : "Make"}
      </button>

      {/* Generation progress bar */}
      {isGenerating && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-rose-700 mb-1">
            <span>Making… {progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
