// Explicit After Dark scene cores — harder prompts, anatomy lock, bedroom, shared negatives

export type SceneCore = {
  id: string;
  title: string;
  prompt: string;
  negative: string;
};

const SHARED_NEG =
  "deformed, bad anatomy, extra limbs, missing limbs, fused fingers, too many fingers, " +
  "mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed face, " +
  "blurry, low quality, watermark, text, logo, clothed, clothes, underwear, " +
  "standing full body portrait, soft focus, weak lighting, cartoon, anime, 3d render";

const ANATOMY_LOCK =
  "correct human anatomy, realistic proportions, detailed genitals, proper penetration depth, " +
  "visible insertion, accurate male and female anatomy, no floating limbs";

const BEDROOM =
  "intimate bedroom, dim warm lighting, rumpled sheets, soft pillows, night atmosphere";

export const AFTER_DARK_CORES: Record<string, SceneCore> = {
  "in-bed": {
    id: "in-bed",
    title: "In bed",
    prompt: `${BEDROOM}, couple in bed, man on top, deep penetration, legs wrapped, sweat, intense eye contact, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG,
  },
  "spread-open": {
    id: "spread-open",
    title: "Spread open",
    prompt: `${BEDROOM}, woman on back, legs spread wide, knees pulled up, fully exposed, man between her legs thrusting deep, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG,
  },
  filled: {
    id: "filled",
    title: "Filled",
    prompt: `${BEDROOM}, close-up of penetration, cock fully buried, stretched entrance, cum leaking slightly, detailed genitals, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG,
  },
  marked: {
    id: "marked",
    title: "Marked",
    prompt: `${BEDROOM}, after sex, woman with cum on face, chest and stomach, marked by partner, satisfied expression, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG,
  },
  bbc: {
    id: "bbc",
    title: "BBC",
    prompt: `${BEDROOM}, interracial, large black cock, deep penetration, size contrast, woman stretched, intense pleasure, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG,
  },
  "he-watches": {
    id: "he-watches",
    title: "He watches",
    prompt: `${BEDROOM}, cuckold scene, husband watching from chair while another man fucks his wife hard, eye contact with husband, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG,
  },
  mmf: {
    id: "mmf",
    title: "MMF",
    prompt: `${BEDROOM}, MMF threesome, woman in middle, one cock in pussy one in mouth, double penetration oral, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG + ", extra people, wrong count of limbs",
  },
  double: {
    id: "double",
    title: "Double",
    prompt: `${BEDROOM}, double penetration, one cock in pussy one in ass, woman filled completely, intense expression, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG + ", wrong orifice, floating cocks",
  },
  "doggystyle-double-penis": {
    id: "doggystyle-double-penis",
    title: "Doggystyle Double Penis",
    prompt: `${BEDROOM}, doggystyle, woman on all fours, two men, one penetrating pussy from behind, second cock in mouth or ass, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG + ", standing, portrait, weak penetration",
  },
  ffm: {
    id: "ffm",
    title: "FFM",
    prompt: `${BEDROOM}, FFM threesome, two women one man, man fucking one while the other kisses or licks, detailed anatomy, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG + ", extra people",
  },
  "pov-anal": {
    id: "pov-anal",
    title: "POV Anal",
    prompt: `${BEDROOM}, POV from behind, anal penetration, tight entrance stretched, deep thrusts, realistic ass and cock, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG + ", vaginal, soft poses",
  },
  "hungry-oral": {
    id: "hungry-oral",
    title: "Hungry oral",
    prompt: `${BEDROOM}, woman on knees, deepthroat, cock in mouth to base, saliva, eye contact, hungry expression, detailed oral, ${ANATOMY_LOCK}`,
    negative: SHARED_NEG + ", standing portrait, closed mouth",
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
      prompt: "intimate couple, bedroom, realistic",
      negative: SHARED_NEG,
    };
  }

  let prompt = core.prompt;
  if (faceDescription) prompt = `${faceDescription}, ${prompt}`;
  if (outfitDescription) prompt = `${outfitDescription}, ${prompt}`;
  if (role) prompt = `${role}, ${prompt}`;

  return { prompt, negative: core.negative };
}
