export type PromptCastMember = { role?: string };

export const VERSION_VARIANTS = [
  "",
  "CAMERA ONLY: slightly wider full-body framing; same people, same act, same room type as the scene description.",
  "CAMERA ONLY: tighter crop on faces and torsos; same people, same act, same room type as the scene description.",
  "LIGHT ONLY: warmer side light, softer shadows; same people, same act, same room type as the scene description.",
];

export const GLOBAL_NEGATIVES =
  "wrong room, shower stall when not requested, bathroom tiles when not requested, steam mirror selfie when not requested, standing wet couple when not requested, different sex act than described, swapped positions, wrong number of people, extra person, extra limbs, fused bodies, deformed genitals, beauty-filter face, different hair than reference, watermark, text overlay, logo, identical twin faces";

export const FACE_LOCK =
  "FACE LOCK: use the face photos as identity. Same bone structure, eyes, nose, mouth, skin tone, hair colour and style as the face references. Body photos are only for body shape and posture — do not change the face from the face references. Do not invent a different person. Do not beautify into a model.";

export const PHOTO_LOOK =
  "LOOK: vertical 3:4 photoreal photograph, natural skin texture, real fabric, sharp readable faces, no watermark, no text. Obey the camera, lens, lighting and room written in SCENE. Do not switch the lens to 85mm unless the scene says 85mm.";

export const AVOID_LINE = `AVOID: ${GLOBAL_NEGATIVES}`;

export function buildWhoLine(input: {
  isSolo: boolean;
  labels: string[];
  referenceGuide: string;
  castCount: number;
}) {
  const { isSolo, labels, referenceGuide, castCount } = input;
  return isSolo
    ? `WHO: exactly one adult — ${labels[0] || "the subject"}. ${referenceGuide}. Do not add anyone else.`
    : `WHO: exactly ${castCount} adults — ${labels.join(" and ")}. ${referenceGuide}. Do not add extra people or extra genitals. Do not change anyone's race, skin tone, age, or hair to match a stereotype in the scene text. The uploaded faces win.`;
}

export function buildSoloGuard(isSolo: boolean) {
  return isSolo
    ? "SOLO OVERRIDE: exactly one adult in the entire image. Do not add a partner, lover, second person, duplicate, reflection, background figure, extra face, hand, limb, shadow or partial body. Ignore any scene wording that implies another person; show the selected subject alone."
    : "";
}

export function buildBodyLock(bodyNotes: string, hasBodyHints: boolean) {
  return hasBodyHints && bodyNotes
    ? `BODY NOTE: ${bodyNotes}. Treat these as shape hints the couple chose. Keep the faces from the face references. Do not replace the person. Do not ignore a face photo in favour of a generic body.`
    : "";
}

export function buildAnatomyLock(cast: PromptCastMember[]) {
  const roles = cast.map((person) => String(person.role || ""));
  const men = roles.filter((role) => role.includes("husband") || role.includes("male")).length;
  const women = roles.filter((role) => role.includes("wife") || role.includes("female")).length;
  const total = men + women || cast.length;

  const penisRule =
    men === 0
      ? "no penis anywhere in the image"
      : men === 1
        ? "exactly one penis, attached only to the man at his hips/groin, never attached to a woman, never growing from a chest or breasts, never floating, never between a woman's breasts as if it belongs to her"
        : `exactly ${men} penises, one attached to each man at his hips/groin, none attached to a woman, no extra or anonymous shafts, no floating genitals`;

  return [
    "ANATOMY LOCK:",
    "correct adult human anatomy only.",
    `exactly ${total} people, no extra people.`,
    penisRule,
    "women have only female genitals (vulva), men have only male genitals (penis).",
    "no extra limbs, no extra hands, no fused bodies, no body parts on the wrong person.",
  ].join(" ");
}

export function buildLocationGuard(location: string | null | undefined) {
  return location === "shower"
    ? "Setting: bathroom shower as described."
    : "Setting: match the SCENE location exactly. Not a shower unless the SCENE explicitly says shower.";
}

export function buildOutfitLock(wearer: string) {
  return `OUTFIT LOCK: use the outfit reference only for clothing. Put the ${wearer} into that exact outfit — same garment, colour, fabric, cut, and details. The ${wearer}'s face and identity must come from their own face reference, never from any person shown in the outfit image. Do not invent different clothes.`;
}

export function buildAfterDarkFluxPrompt(scenePrompt: string, hasIdentityReferences: boolean) {
  return [
    "AFTER DARK TRANSFORMATION: Reference 1 is the locked identity and scene photograph.",
    "Preserve every adult's face, identity, hair, skin tone, body proportions and count from Reference 1.",
    "Preserve the exact background, location, room, lighting, camera angle, crop and composition from Reference 1.",
    `Change only the intimate action and necessary anatomy so it matches this instruction exactly: ${scenePrompt}`,
    hasIdentityReferences
      ? "References 2 and 3, when present, are identity references. The uploaded identities win."
      : "",
    "Do not invent different people or a different location. Do not add extra people, faces, limbs or genitals.",
  ].filter(Boolean).join(" ");
}

export function buildAfterDarkContinuityPrompt() {
  return [
    "FINAL IDENTITY CORRECTION ONLY.",
    "Reference 1 is the finished After Dark image. Preserve its adult action, anatomy, pose, body positions, clothing, background, location, lighting, camera angle, crop and composition exactly.",
    "References 2 and 3, when present, are the selected people's identity references. Restore their exact faces, bone structure, eyes, nose, mouth, skin tone, hair colour and hairstyle.",
    "Change faces and identity only. Do not censor, cover, move, redraw or replace the bodies. Do not change the scene. Do not add or remove anyone.",
  ].join(" ");
}

export function buildOutfitEditPrompt(wearer: string) {
  return [
    `EDIT ONLY THE CLOTHING ON THE ${wearer.toUpperCase()}.`,
    "Reference 1 is the already-generated scene. Preserve every person's face, identity, body, pose, position, expression, anatomy, lighting, framing and background exactly.",
    `Reference 2 is the outfit reference. Dress only the ${wearer} in that exact garment — same colour, fabric, cut and visible details.`,
    "Do not replace, redraw, beautify or change any face. Do not add or remove people. Do not change any other person's clothing.",
  ].join(" ");
}

export function buildSoloCleanupPrompt(subject: string, hasIdentityReference: boolean) {
  return [
    "SOLO ENFORCEMENT EDIT: the finished image must contain exactly one adult person in total.",
    `Keep only the ${subject}. Remove every other person completely, including partial bodies, faces, hands, limbs, reflections, shadows and background figures.`,
    hasIdentityReference
      ? "Reference 1 is the scene to correct. Reference 2 is the only person's identity. Preserve that face exactly."
      : "Reference 1 is the scene to correct. Preserve the remaining subject's face and identity exactly.",
    "Reconstruct the original SCENE background naturally where anyone is removed. Preserve the original location, time of day, weather, lighting and framing exactly; never change a street, bathroom or other instructed setting into a bedroom. Preserve the selected subject's pose, clothing, anatomy and photographic realism.",
    "Do not add a partner, lover, duplicate or implied second person. No one may touch, hold or appear beside the subject.",
  ].join(" ");
}
