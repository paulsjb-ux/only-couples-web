export type OutfitTab = "soft" | "playful" | "afterdark";

export type OutfitPreset = {
  id: string;
  tab: OutfitTab;
  label: string;
  imageUrl: string;
};

export const OUTFIT_TABS: { id: OutfitTab; label: string }[] = [
  { id: "soft", label: "Soft" },
  { id: "playful", label: "Playful" },
  { id: "afterdark", label: "After dark" },
];

import { OUTFIT_PRESETS as GENERATED } from "./presets.generated";

export const OUTFIT_PRESETS: OutfitPreset[] = GENERATED;

export function presetsForTab(tab: OutfitTab): OutfitPreset[] {
  return OUTFIT_PRESETS.filter((p) => p.tab === tab);
}

export function findPreset(id: string | null | undefined): OutfitPreset | undefined {
  if (!id) return undefined;
  return OUTFIT_PRESETS.find((p) => p.id === id);
}
