import { useState } from "react";
import { OUTFIT_TABS, presetsForTab, type OutfitPreset, type OutfitTab } from "./presets";

type Props = {
  selectedId?: string | null;
  onSelect: (preset: OutfitPreset) => void;
  primary?: string;
};

export function OutfitPicker({ selectedId, onSelect, primary = "#6B2D3C" }: Props) {
  const [tab, setTab] = useState<OutfitTab>("soft");
  const items = presetsForTab(tab);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OUTFIT_TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                borderRadius: 999,
                border: `1px solid ${primary}`,
                background: active ? primary : "white",
                color: active ? "white" : primary,
                padding: "8px 14px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>
          No looks in this tab yet. Add images to public/outfits/{tab} and run npm run scan-outfits.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {items.map((item) => {
            const selected = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                style={{
                  flex: "0 0 auto",
                  width: 96,
                  padding: 0,
                  border: selected ? `2px solid ${primary}` : "2px solid transparent",
                  borderRadius: 12,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  style={{
                    width: 92,
                    height: 116,
                    objectFit: "cover",
                    borderRadius: 10,
                    display: "block",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    marginTop: 4,
                    lineHeight: 1.2,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
