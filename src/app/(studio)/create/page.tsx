// Relevant UI + progress sections for The Other Room create page
// (Integrate these snippets into your existing page.tsx)

"use client";

import { useState, useRef } from "react";
// ... other existing imports ...

export default function CreatePage() {
  // ... existing state ...
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ... existing handlers ...

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
      // ... your existing generate call ...
      // On success:
      setProgress(100);
    } catch (err) {
      // handle error
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setIsGenerating(false);
      // optionally reset progress after a short delay
    }
  };

  return (
    <div className="/* your existing layout */">
      {/* ... existing content ... */}

      {/* Upload buttons — rose primary + outline pills, sr-only native inputs */}
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <span className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition">
          Choose face photo
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={/* handleFaceUpload */}
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
          onChange={/* handleOutfitUpload */}
        />
      </label>

      {/* Role select — rounded */}
      <select
        className="rounded-full border border-rose-200 bg-cream-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
        value={/* role */}
        onChange={/* setRole */}
      >
        <option value="female-lover">Female lover</option>
        <option value="male-lover">Male lover</option>
        <option value="both">Both</option>
      </select>

      {/* Generation progress bar */}
      {isGenerating && (
        <div className="w-full max-w-md">
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

      {/* ... rest of page ... */}
    </div>
  );
}
