/**
 * Outfit selection + prompt builder for the Face · Outfit · Scene app flow.
 *
 * Drop this next to scene-cores-recode.ts and wire it into your Create screen.
 */

import { getSceneCore, SCENE_CORES } from "./scene-cores-recode";

// ── Types ────────────────────────────────────────────────────────────────────

export type MediaRef = {
  id: string;
  uri: string;          // local file path or remote URL
  label?: string;       // e.g. "Wife", "Red dress"
};

export type CastMember = {
  face: MediaRef;       // required face lock
  role?: string;        // "Wife", "Husband", etc.
};

export type GenerationRequest = {
  /** Ordered faces → {p1}, {p2}, {p3} */
  cast: CastMember[];
  /** Optional outfit reference applied to {p1} (the main woman) */
  outfit?: MediaRef;
  /** Scene key, e.g. "romance-kiss", "erotic-doggy" */
  sceneId: string;
  /** How many image variants to generate */
  versions: 1 | 2 | 3 | 4;
};

// ── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Builds the final image-generation prompt.
 * - Pulls the scene core via getSceneCore (includes location + act locks)
 * - Injects face placeholders
 * - Adds OUTFIT LOCK only when the user selected an outfit
 */
export function buildGenerationPrompt(req: GenerationRequest): string {
  let prompt = getSceneCore(req.sceneId);

  if (!prompt) {
    throw new Error(`Unknown sceneId: ${req.sceneId}`);
  }

  // Face identity locks
  const p1 = req.cast[0]?.face.label ?? req.cast[0]?.face.id ?? "person1";
  const p2 = req.cast[1]?.face.label ?? req.cast[1]?.face.id ?? "person2";
  const p3 = req.cast[2]?.face.label ?? req.cast[2]?.face.id ?? "person3";

  prompt = prompt
    .replace(/{p1}/g, p1)
    .replace(/{p2}/g, p2)
    .replace(/{p3}/g, p3);

  // Outfit lock — only when user uploaded / selected one
  if (req.outfit) {
    prompt +=
      ` OUTFIT LOCK: Dress {p1} (the woman) in the exact outfit from the outfit reference image` +
      (req.outfit.label ? ` ("${req.outfit.label}")` : "") +
      `. Match garment type, colour, fabric, pattern and style precisely. ` +
      `Do not invent clothing. Do not leave her nude if an outfit was provided.`;
  }

  return prompt;
}

/**
 * Recommended negative prompt.
 * Always include the shower ban for non-bathroom scenes.
 */
export function buildNegativePrompt(sceneId: string, hasOutfit: boolean): string {
  const bathroomScenes = new Set([
    "romance-shower",
    "zen-shower-pose",
    "zen-foam-shower",
    "zen-low-angle",
    "zen-carpet-kneel",
  ]);

  const parts: string[] = [
    "deformed, extra limbs, bad anatomy, blurry, low quality, watermark, text, logo",
  ];

  if (!bathroomScenes.has(sceneId)) {
    parts.push(
      "shower, bathroom, wet tile, steam, glass shower door, bathroom mirror selfie, running water, soap suds, bathtub"
    );
  }

  if (hasOutfit) {
    parts.push(
      "nude, naked, fully nude, wrong outfit, different clothes, missing garment, changed colour, changed dress"
    );
  }

  return parts.join(", ");
}

// ── UI state helpers (React / React Native style) ────────────────────────────

export type CreateScreenState = {
  cast: CastMember[];
  outfit?: MediaRef;
  sceneId?: string;
  versions: 1 | 2 | 3 | 4;
};

export const initialCreateState: CreateScreenState = {
  cast: [],
  outfit: undefined,
  sceneId: undefined,
  versions: 1,
};

/** Call when user picks an outfit photo */
export function setOutfit(
  state: CreateScreenState,
  outfit: MediaRef | undefined
): CreateScreenState {
  return { ...state, outfit };
}

/** Call when user picks a scene */
export function setScene(
  state: CreateScreenState,
  sceneId: string
): CreateScreenState {
  if (!(sceneId in SCENE_CORES)) {
    throw new Error(`Unknown scene: ${sceneId}`);
  }
  return { ...state, sceneId };
}

/** Build the payload you send to your generation API */
export function toGenerationPayload(state: CreateScreenState) {
  if (!state.sceneId) throw new Error("No scene selected");
  if (state.cast.length < 1) throw new Error("At least one face is required");

  const prompt = buildGenerationPrompt({
    cast: state.cast,
    outfit: state.outfit,
    sceneId: state.sceneId,
    versions: state.versions,
  });

  const negativePrompt = buildNegativePrompt(
    state.sceneId,
    Boolean(state.outfit)
  );

  return {
    prompt,
    negativePrompt,
    versions: state.versions,
    // Pass media URIs so your backend can attach them as reference images
    references: {
      faces: state.cast.map((c) => c.face.uri),
      outfit: state.outfit?.uri,
    },
  };
}

// ── Example React Native UI wiring (optional) ────────────────────────────────
//
// <View>
//   <Text>OUTFIT (optional)</Text>
//   {outfit ? (
//     <Image source={{ uri: outfit.uri }} />
//   ) : (
//     <Button title="Add outfit" onPress={pickOutfitImage} />
//   )}
//   {outfit && (
//     <Button title="Clear outfit" onPress={() => setOutfit(state, undefined)} />
//   )}
// </View>
//
// On "Use this scene":
//   const payload = toGenerationPayload(state);
//   await generateImages(payload);
