"use client";

/**
 * DROP-IN COMPONENT
 * -----------------
 * 1. Copy this file to src/components/CreateUploads.tsx
 * 2. In your create/page.tsx:
 *
 *    import CreateUploads from "@/components/CreateUploads";
 *
 *    // then replace the entire broken upload + role + Make section with:
 *    <CreateUploads
 *      onFaceSelect={(file) => { /* your setFaceFile(file) */ }}
 *      onOutfitSelect={(file) => { /* your setOutfitFile(file) */ }}
 *      onGenerate={async (role) => {
 *        // your existing generate logic here
 *        // e.g. await fetch("/api/generate", { body: JSON.stringify({ role, ... }) })
 *      }}
 *    />
 *
 * That is all. The rose pills + progress bar are fully contained.
 */

import { useState, useRef, ChangeEvent } from "react";

type Props = {
  onFaceSelect?: (file: File) => void;
  onOutfitSelect?: (file: File) => void;
  onGenerate?: (role: string) => Promise<void> | void;
  defaultRole?: string;
};

export default function CreateUploads({
  onFaceSelect,
  onOutfitSelect,
  onGenerate,
  defaultRole = "female-lover",
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [role, setRole] = useState(defaultRole);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFace = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFaceSelect) onFaceSelect(file);
  };

  const handleOutfit = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onOutfitSelect) onOutfitSelect(file);
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
    if (isGenerating) return;
    setIsGenerating(true);
    startProgress();

    try {
      if (onGenerate) await onGenerate(role);
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 700);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md">
      {/* Rose pill uploads — native inputs are hidden */}
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex items-center cursor-pointer">
          <span className="px-4 py-2.5 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 active:bg-rose-200 transition select-none">
            Choose face photo
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFace}
          />
        </label>

        <label className="inline-flex items-center cursor-pointer">
          <span className="px-4 py-2.5 rounded-full border border-rose-300 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 active:bg-rose-200 transition select-none">
            Upload outfit photo
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleOutfit}
          />
        </label>
      </div>

      {/* Role select */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full sm:w-auto rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-300"
      >
        <option value="female-lover">Female lover</option>
        <option value="male-lover">Male lover</option>
        <option value="both">Both</option>
      </select>

      {/* Make button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 disabled:opacity-55 disabled:cursor-not-allowed transition"
      >
        {isGenerating ? "Making…" : "Make"}
      </button>

      {/* Progress bar — only visible while generating */}
      {isGenerating && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-rose-700 mb-1.5">
            <span>Making… {progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-rose-100 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
