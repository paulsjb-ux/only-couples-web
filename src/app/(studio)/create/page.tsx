"use client";

import { useState, useRef, ChangeEvent } from "react";

const hideFile: React.CSSProperties = {
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

const pill: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: 9999,
  border: "1px solid #fda4af",
  background: "#fff1f2",
  color: "#be123c",
  fontSize: 14,
  fontWeight: 500,
};

const card: React.CSSProperties = {
  flex: 1,
  minWidth: 140,
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #fce7f3",
  padding: 16,
  textAlign: "center",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 9999,
  border: "1px solid #fecdd3",
  padding: "12px 16px",
  fontSize: 14,
  background: "#fff",
  color: "#1c1917",
  marginBottom: 12,
};

const SOFT_SCENES = [
  { id: "soft-embrace", label: "Soft embrace" },
  { id: "playful", label: "Playful" },
  { id: "close-portrait", label: "Close portrait" },
];

const AFTER_DARK = [
  { id: "in-bed", label: "In bed" },
  { id: "spread-open", label: "Spread open" },
  { id: "filled", label: "Filled" },
  { id: "marked", label: "Marked" },
  { id: "bbc", label: "BBC" },
  { id: "he-watches", label: "He watches" },
  { id: "mmf", label: "MMF" },
  { id: "double", label: "Double" },
  { id: "doggystyle-double", label: "Doggystyle Double" },
  { id: "ffm", label: "FFM" },
  { id: "pov-anal", label: "POV Anal" },
  { id: "hungry-oral", label: "Hungry oral" },
];

export default function CreatePage() {
  const [youFile, setYouFile] = useState<File | null>(null);
  const [partnerFile, setPartnerFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [youPreview, setYouPreview] = useState<string | null>(null);
  const [partnerPreview, setPartnerPreview] = useState<string | null>(null);
  const [role, setRole] = useState("female-lover");
  const [intensity, setIntensity] = useState<"soft" | "after-dark">("soft");
  const [sceneId, setSceneId] = useState("soft-embrace");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onFile = (
    e: ChangeEvent<HTMLInputElement>,
    who: "you" | "partner" | "outfit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (who === "you") {
      setYouFile(file);
      setYouPreview(url);
    } else if (who === "partner") {
      setPartnerFile(file);
      setPartnerPreview(url);
    } else {
      setOutfitFile(file);
    }
  };

  const scenes = intensity === "soft" ? SOFT_SCENES : AFTER_DARK;

  const startProgress = () => {
    setProgress(8);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) {
          if (progressRef.current) clearInterval(progressRef.current);
          return 92;
        }
        return p + Math.floor(Math.random() * 6) + 3;
      });
    }, 400);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (!youFile || !partnerFile) {
      alert("Add a face photo for both of you first.");
      return;
    }
    setIsGenerating(true);
    startProgress();
    try {
      // TODO: POST /api/generate
      // body: { youFile, partnerFile, outfitFile, role, sceneId, intensity }
      console.log("Generate", {
        role,
        sceneId,
        intensity,
        you: youFile.name,
        partner: partnerFile.name,
        outfit: outfitFile?.name,
      });
      await new Promise((r) => setTimeout(r, 2500));
      setProgress(100);
    } catch (err) {
      console.error(err);
    } finally {
      if (progressRef.current) clearInterval(progressRef.current);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 700);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf8f6", color: "#1c1917" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid #e7e5e4",
          background: "#fff",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#6b3a42",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ☰
        </div>
        <h1
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize: 18,
            fontWeight: 400,
            margin: 0,
          }}
        >
          The Other Room
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: 14, color: "#78716c", marginBottom: 20 }}>
          Your faces — both of you. Soft by default.
        </p>

        {/* You + Partner */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={card}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                margin: "0 auto 12px",
                background: youPreview
                  ? `center / cover no-repeat url(${youPreview})`
                  : "#fce7f3",
                border: "2px solid #fda4af",
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#881337" }}>
              You
            </div>
            <div style={{ fontSize: 11, color: "#a8a29e", marginBottom: 10 }}>
              {youFile ? youFile.name : "Face photo"}
            </div>
            <label style={{ cursor: "pointer", position: "relative" }}>
              <span style={pill}>{youFile ? "Change photo" : "Add face"}</span>
              <input type="file" accept="image/*" style={hideFile} onChange={(e) => onFile(e, "you")} />
            </label>
          </div>

          <div style={card}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                margin: "0 auto 12px",
                background: partnerPreview
                  ? `center / cover no-repeat url(${partnerPreview})`
                  : "#fce7f3",
                border: "2px solid #fda4af",
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#881337" }}>
              Partner
            </div>
            <div style={{ fontSize: 11, color: "#a8a29e", marginBottom: 10 }}>
              {partnerFile ? partnerFile.name : "Face photo"}
            </div>
            <label style={{ cursor: "pointer", position: "relative" }}>
              <span style={pill}>{partnerFile ? "Change photo" : "Add face"}</span>
              <input
                type="file"
                accept="image/*"
                style={hideFile}
                onChange={(e) => onFile(e, "partner")}
              />
            </label>
          </div>
        </div>

        {/* Outfit */}
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <label style={{ cursor: "pointer", position: "relative" }}>
            <span style={pill}>
              {outfitFile ? `Outfit: ${outfitFile.name}` : "Upload outfit photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              style={hideFile}
              onChange={(e) => onFile(e, "outfit")}
            />
          </label>
        </div>

        {/* Role — lovers */}
        <label style={{ display: "block", fontSize: 12, color: "#78716c", marginBottom: 6 }}>
          Role
        </label>
        <select
          style={selectStyle}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="female-lover">Female lover</option>
          <option value="male-lover">Male lover</option>
          <option value="both">Both</option>
        </select>

        {/* Intensity */}
        <label style={{ display: "block", fontSize: 12, color: "#78716c", marginBottom: 6 }}>
          Intensity
        </label>
        <select
          style={selectStyle}
          value={intensity}
          onChange={(e) => {
            const v = e.target.value as "soft" | "after-dark";
            setIntensity(v);
            setSceneId(v === "soft" ? "soft-embrace" : "in-bed");
          }}
        >
          <option value="soft">Soft / Playful</option>
          <option value="after-dark">After dark</option>
        </select>

        {/* Scene */}
        <label style={{ display: "block", fontSize: 12, color: "#78716c", marginBottom: 6 }}>
          Scene
        </label>
        <select
          style={selectStyle}
          value={sceneId}
          onChange={(e) => setSceneId(e.target.value)}
        >
          {scenes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            width: "100%",
            borderRadius: 9999,
            border: "none",
            padding: "14px 16px",
            background: isGenerating ? "#fb7185" : "#f43f5e",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            opacity: isGenerating ? 0.75 : 1,
            marginTop: 8,
          }}
        >
          {isGenerating ? "Making…" : "Make"}
        </button>

        {isGenerating && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, color: "#be123c", marginBottom: 6 }}>
              Making… {progress}%
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 9999,
                background: "#ffe4e6",
                overflow: "hidden",
              }}
            >
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
      </main>
    </div>
  );
}
