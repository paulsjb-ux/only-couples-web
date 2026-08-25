"use client";

import { useState, useRef, ChangeEvent } from "react";

const hideFileInput: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: 9999,
  border: "1px solid #fda4af",
  background: "#fff1f2",
  color: "#be123c",
  fontSize: 14,
  fontWeight: 500,
};

export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [role, setRole] = useState("female-lover");
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFaceUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("Face:", file.name);
  };

  const handleOutfitUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("Outfit:", file.name);
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
    <div style={{ minHeight: "100vh", background: "#faf8f6", padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <label style={{ cursor: "pointer", position: "relative" }}>
          <span style={pillStyle}>Choose face photo</span>
          <input type="file" accept="image/*" style={hideFileInput} onChange={handleFaceUpload} />
        </label>
        <label style={{ cursor: "pointer", position: "relative" }}>
          <span style={pillStyle}>Upload outfit photo</span>
          <input type="file" accept="image/*" style={hideFileInput} onChange={handleOutfitUpload} />
        </label>
      </div>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{
          width: "100%",
          borderRadius: 9999,
          border: "1px solid #fecdd3",
          padding: "10px 16px",
          fontSize: 14,
          marginBottom: 16,
          background: "#fff",
        }}
      >
        <option value="female-lover">Female lover</option>
        <option value="male-lover">Male lover</option>
        <option value="both">Both</option>
      </select>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          width: "100%",
          borderRadius: 9999,
          border: "none",
          padding: "12px 16px",
          background: isGenerating ? "#fb7185" : "#f43f5e",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          opacity: isGenerating ? 0.7 : 1,
        }}
      >
        {isGenerating ? "Making…" : "Make"}
      </button>

      {isGenerating && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 14, color: "#be123c", marginBottom: 6 }}>
            Making… {progress}%
          </div>
          <div style={{ height: 8, borderRadius: 9999, background: "#ffe4e6", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#f43f5e",
                borderRadius: 9999,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
