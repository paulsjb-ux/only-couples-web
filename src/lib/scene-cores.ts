// After Dark scene cores — maximum explicit adherence
// Rule: on a bed + full explicit sexual activity unless title requires otherwise.
// Structure per prompt: subject → locked pose → explicit act → camera → bed/lighting → anatomy → quality

export type SceneCore = {
  id: string;
  title: string;
  prompt: string;
  negative: string;
};

const SHARED_NEG =
  "standing portrait, full body standing, softcore, implied sex, suggestive only, " +
  "clothed, clothes, underwear, bra, panties, covered genitals, censored, mosaic, " +
  "no penetration, closed legs, distant shot, fully dressed, weak penetration, " +
  "deformed, bad anatomy, extra limbs, missing limbs, fused fingers, too many fingers, " +
  "mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed face, " +
  "extra penises, floating limbs, disconnected body, blurry, low quality, watermark, " +
  "text, logo, cartoon, anime, 3d render, plastic skin, doll-like";

const ANATOMY =
  "correct human anatomy, realistic proportions, detailed genitals, visible insertion, " +
  "proper penetration depth, accurate male and female anatomy, realistic skin, sweat sheen";

const BED =
  "on a bed, rumpled white sheets, pillows, intimate bedroom, dim warm lamp light, night";

const QUALITY =
  "photorealistic, sharp focus, detailed skin texture, cinematic lighting";

export const AFTER_DARK_CORES: Record<string, SceneCore> = {
  "in-bed": {
    id: "in-bed",
    title: "In bed",
    prompt: [
      "couple having sex on a bed, man on top in missionary",
      "his cock fully buried deep in her pussy, hips pressed flush against her",
      "her legs wrapped tight around his waist, ankles locked",
      "bodies slick with sweat, mouths close, intense eye contact",
      "mid-thrust, explicit penetration clearly visible",
      BED,
      ANATOMY,
      QUALITY,
      "medium shot from slightly above",
    ].join(", "),
    negative: SHARED_NEG,
  },

  "spread-open": {
    id: "spread-open",
    title: "Spread open",
    prompt: [
      "woman on her back on a bed, legs spread wide open",
      "knees pulled up toward her chest, feet in the air",
      "pussy fully exposed and stretched around a cock thrusting deep",
      "man between her legs, holding her thighs, full penetration in frame",
      "explicit sex, wet detailed genitals, her face showing pleasure",
      BED,
      ANATOMY,
      QUALITY,
      "view from between her legs looking up her body",
    ].join(", "),
    negative: SHARED_NEG,
  },

  filled: {
    id: "filled",
    title: "Filled",
    prompt: [
      "extreme close-up of penetration on a bed",
      "thick cock fully buried to the base inside a stretched pussy",
      "labia gripping the shaft, a little cum leaking at the edges",
      "wet glistening skin, pubic area in sharp detail",
      "no faces, only the explicit connection of bodies",
      BED,
      ANATOMY,
      QUALITY,
      "macro close-up, tight crop on genitals",
    ].join(", "),
    negative: SHARED_NEG + ", face, portrait, wide shot, standing",
  },

  marked: {
    id: "marked",
    title: "Marked",
    prompt: [
      "woman lying back on a bed after sex, completely marked",
      "thick cum on her face, tongue, chest, and stomach",
      "messy used look, half-lidded satisfied eyes, flushed skin",
      "nude, legs still slightly open, sheets rumpled around her",
      "explicit aftermath, cum strings and droplets detailed",
      BED,
      ANATOMY,
      QUALITY,
      "medium shot from above",
    ].join(", "),
    negative: SHARED_NEG + ", clean skin, clothed, soft portrait only",
  },

  bbc: {
    id: "bbc",
    title: "BBC",
    prompt: [
      "interracial couple having hard sex on a bed",
      "large thick black cock deep inside her, stretching her wide",
      "clear size contrast, her pussy gripping the shaft",
      "man driving into her, her legs open, body arched in pleasure",
      "explicit full penetration, sweat, intense expression",
      BED,
      ANATOMY,
      QUALITY,
      "medium shot showing bodies and the penetration",
    ].join(", "),
    negative: SHARED_NEG,
  },

  "he-watches": {
    id: "he-watches",
    title: "He watches",
    prompt: [
      "cuckold scene on a bed: wife being fucked hard by another man",
      "deep penetration, her legs spread, clear explicit sex on the mattress",
      "husband sitting on a chair beside the bed watching them",
      "wife looking at her husband while she is taken",
      "three people in frame, sex fully visible on the bed",
      BED,
      ANATOMY,
      QUALITY,
      "wide enough to show bed sex and the watching husband",
    ].join(", "),
    negative: SHARED_NEG + ", only two people, no watcher, softcore",
  },

  mmf: {
    id: "mmf",
    title: "MMF",
    prompt: [
      "MMF threesome on a bed, woman in the middle",
      "one cock deep in her pussy, another cock in her mouth at the same time",
      "she is on her back or side on the sheets, fully used",
      "explicit double involvement, saliva, wet penetration",
      "two men one woman, all genitals and oral clearly shown",
      BED,
      ANATOMY,
      QUALITY,
      "medium shot showing both points of contact",
    ].join(", "),
    negative: SHARED_NEG + ", extra people, wrong limb count, only one man",
  },

  double: {
    id: "double",
    title: "Double",
    prompt: [
      "double penetration on a bed",
      "one cock in her pussy and one cock in her ass at the same time",
      "woman between two men, completely filled, stretched",
      "both insertions clearly visible, explicit sex",
      "her face showing intensity, bodies pressed together on the sheets",
      BED,
      ANATOMY,
      QUALITY,
      "angle that shows both penetrations",
    ].join(", "),
    negative: SHARED_NEG + ", single penetration only, floating cocks, wrong orifice",
  },

  "doggystyle-double-penis": {
    id: "doggystyle-double-penis",
    title: "Doggystyle Double Penis",
    prompt: [
      "woman on all fours on a bed in doggystyle",
      "one man behind her, cock deep in her pussy from behind",
      "second man in front, his cock in her mouth",
      "explicit spit-roast on the mattress, arched back, full penetration and oral",
      "sheets under her knees and hands",
      BED,
      ANATOMY,
      QUALITY,
      "side three-quarter view showing both acts",
    ].join(", "),
    negative: SHARED_NEG + ", standing, off the bed, weak penetration, portrait",
  },

  ffm: {
    id: "ffm",
    title: "FFM",
    prompt: [
      "FFM threesome on a bed, two women and one man",
      "man fucking one woman with deep clear penetration",
      "second woman kissing her or licking her body or clit",
      "all three nude on the sheets, explicit sex in progress",
      "detailed genitals and contact points visible",
      BED,
      ANATOMY,
      QUALITY,
      "medium shot of the three on the bed",
    ].join(", "),
    negative: SHARED_NEG + ", only one woman, extra people, softcore",
  },

  "pov-anal": {
    id: "pov-anal",
    title: "POV Anal",
    prompt: [
      "POV from behind on a bed, explicit anal sex",
      "cock buried deep in her ass, tight ring stretched around the shaft",
      "her cheeks spread, back arched, face down or looking back",
      "deep thrusts, realistic ass and cock detail, no vaginal",
      "first-person view as if the viewer is penetrating her",
      BED,
      ANATOMY,
      QUALITY,
      "POV close behind, focus on anal insertion",
    ].join(", "),
    negative: SHARED_NEG + ", vaginal only, soft pose, standing, face portrait only",
  },

  "hungry-oral": {
    id: "hungry-oral",
    title: "Hungry oral",
    prompt: [
      "woman on her knees on a bed, giving deepthroat",
      "cock in her mouth all the way to the base, lips sealed around it",
      "saliva dripping, tears at the corners of her eyes, hungry expression",
      "looking up at the camera or the man, explicit oral sex",
      "hands on his thighs or balls, messy and eager",
      BED,
      ANATOMY,
      QUALITY,
      "close medium shot of face and oral penetration",
    ].join(", "),
    negative: SHARED_NEG + ", closed mouth, no oral, standing portrait, soft pose",
  },
};

export function buildScenePrompt(
  sceneId: string,
  faceDescription?: string,
  outfitDescription?: string,
  role?: string
): { prompt: string; negative: string } {
  const core = AFTER_DARK_CORES[sceneId];
  if (!core) {
    return {
      prompt: [
        "couple having explicit sex on a bed",
        "full deep penetration, bodies pressed together",
        BED,
        ANATOMY,
        QUALITY,
      ].join(", "),
      negative: SHARED_NEG,
    };
  }

  let prompt = core.prompt;
  // Face / identity first so the model locks the person before the act
  if (faceDescription) prompt = `${faceDescription}, ${prompt}`;
  if (role) prompt = `${role}, ${prompt}`;
  // Outfit rarely applies to fully explicit nude scenes; keep only if provided
  if (outfitDescription) prompt = `${prompt}, ${outfitDescription}`;

  return { prompt, negative: core.negative };
}
