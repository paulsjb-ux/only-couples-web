/**
 * Engine routing for The Other Room
 * ---------------------------------
 * Primary (best cost/quality): Seedream 5 Lite Uncensored via Wiro
 * Premium (best anatomy):      Flux Klein NSFW via ZenCreator
 * Draft:                       SDXL via ZenCreator
 */

export type EngineId = "seedream-uncensored" | "flux-klein-nsfw" | "sdxl";

export const ENGINES: Record<
  EngineId,
  { label: string; provider: "wiro" | "zencreator"; costHint: string }
> = {
  "seedream-uncensored": {
    label: "Seedream 5 Lite Uncensored",
    provider: "wiro",
    costHint: "~$0.03",
  },
  "flux-klein-nsfw": {
    label: "Flux Klein NSFW",
    provider: "zencreator",
    costHint: "~2 credits",
  },
  sdxl: {
    label: "SDXL (draft)",
    provider: "zencreator",
    costHint: "1 credit",
  },
};

export function resolveEngine(raw?: string): EngineId {
  if (raw === "flux-klein-nsfw" || raw === "sdxl" || raw === "seedream-uncensored") {
    return raw;
  }
  // Default = best cost/quality balance
  return "seedream-uncensored";
}
