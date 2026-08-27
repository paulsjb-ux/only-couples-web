"use client";

import { useMemo, useState } from "react";
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
 * Same UX as the Face catalog:
 * helper text, dropdown filter, 3-column cards, burgundy selected ring.
 */
export function OutfitPicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<OutfitTab>("soft");
  const items = useMemo(() => presetsForTab(tab), [tab]);

  return (
    <section style={{ marginTop: 8 }}>
      <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px" }}>
        Choose an outfit
      </h2>
      <p style={{ fontSize: 14, color: "#555", margin: "0 0 14px" }}>
        From the catalog. Becomes that scene’s clothing lock.
      </p>

      <label
        style={{
          display: "block",
          fontSize: 12,
          letterSpacing: "0.08em",
          color: "#8A7A6A",
          marginBottom: 6,
        }}
      >
        OUTFIT SET
      </label>
      <select
        value={tab}
        onChange={(e) => setTab(e.target.value as OutfitTab)}
        style={{
          width: "100%",
          borderRadius: 22,
          border: "1px solid #E4D8CC",
          padding: "12px 16px",
          fontSize: 16,
          marginBottom: 16,
          background: "white",
        }}
      >
        {OUTFIT_TABS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      <p style={{ fontSize: 14, margin: "0 0 10px" }}>
        {items.length} looks
      </p>

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
                border: on ? "3px solid #7A3B3F" : "1px solid #E8DDD3",
                borderRadius: 16,
                background: "white",
                overflow: "hidden",
                textAlign: "left",
              }}
            >
              <div style={{ background: "#5c2f36" }}>
                <img
                  src={p.imageUrl}
                  alt={p.label}
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div style={{ padding: "8px 8px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  {tabLabel(p.tab)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function tabLabel(tab: OutfitTab) {
  if (tab === "afterdark") return "After dark";
  if (tab === "playful") return "Playful";
  return "Soft";
}
