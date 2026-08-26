"use client";

import { useState } from "react";
import {
  OUTFIT_TABS,
  presetsForTab,
  type OutfitPreset,
  type OutfitTab,
} from "./presets";

type Props = {
  value?: string | null;
  onChange: (preset: OutfitPreset | null) => void;
};

/**
 * Drop this on the Create card under MEDIA.
 * Shows Soft / Playful / After dark thumbnails from OUTFIT_PRESETS.
 */
export function OutfitPicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<OutfitTab>("soft");
  const items = presetsForTab(tab);

  return (
    <div style={{ marginTop: 16 }}>
      <p
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          color: "#8A7A6A",
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        OUTFIT CATALOG
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {OUTFIT_TABS.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 22,
                border: on ? "none" : "1px solid #E4D8CC",
                background: on ? "#7A3B3F" : "white",
                color: on ? "white" : "#333",
                fontSize: 14,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {items.map((p) => {
          const on = p.id === value;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(on ? null : p)}
              style={{
                padding: 0,
                border: on ? "3px solid #7A3B3F" : "3px solid transparent",
                borderRadius: 16,
                background: "none",
                textAlign: "center",
              }}
            >
              <img
                src={p.imageUrl}
                alt={p.label}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 12,
                  display: "block",
                  background: "#eee",
                }}
              />
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  color: on ? "#7A3B3F" : "#444",
                  padding: "6px 4px 4px",
                }}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {items.length === 0 && (
        <p style={{ fontSize: 13, color: "#9A8B7B" }}>
          No outfits in this tab. Check public/outfits/{tab}/ and presets.generated.ts
        </p>
      )}
    </div>
  );
}
