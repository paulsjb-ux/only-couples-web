/**
 * After Dark scene cores — explicit prompts
 * Rule: unless the title clearly implies another location (e.g. shower),
 * the scene is on a bed and shows full explicit sexual activity.
 */

export type SceneCore = {
  id: string;
  title: string;
  /** Positive prompt body (anatomy + act + setting) */
  core: string;
  /** Extra positives locked for this scene */
  lock?: string;
};

const BED =
  "on a bed in a private bedroom, rumpled sheets, intimate lighting, full body visible when relevant";
const EXPLICIT =
  "full explicit sexual activity, clear penetration or oral contact as the scene requires, detailed anatomy, realistic skin, no censorship, no clothing covering genitals during the act";
const ANATOMY_LOCK =
  "correct human anatomy, one head per person, correct number of limbs, coherent multi-person poses, no merged bodies, no extra limbs";
const SHARED_NEG =
  "standing portrait, soft non-sexual pose, clothed only, censored, blurred genitals, wrong anatomy, extra arms, extra legs, melted bodies, text, watermark, low quality, deformed face";

export const SCENE_CORES: SceneCore[] = [
  {
    id: "in-bed",
    title: "In bed",
    core: `${BED}, couple having full intercourse, bodies pressed together, ${EXPLICIT}`,
    lock: "missionary or side-by-side intimacy on the mattress",
  },
  {
    id: "spread-open",
    title: "Spread open",
    core: `${BED}, receiving partner legs spread open, genitals fully visible, active penetration, ${EXPLICIT}`,
    lock: "clear view of penetration, aroused anatomy",
  },
  {
    id: "filled",
    title: "Filled",
    core: `${BED}, deep penetration, receiving partner clearly filled, intense explicit sex, ${EXPLICIT}`,
    lock: "visible insertion, tight contact",
  },
  {
    id: "marked",
    title: "Marked",
    core: `${BED}, explicit sex with visible marks of passion (reddened skin, grip marks), climax or afterglow still fully nude and explicit, ${EXPLICIT}`,
    lock: "sexual aftermath still graphic, not soft portrait",
  },
  {
    id: "bbc",
    title: "BBC",
    core: `${BED}, interracial explicit intercourse, large dark penis clearly penetrating, ${EXPLICIT}`,
    lock: "size contrast visible, full penetration",
  },
  {
    id: "he-watches",
    title: "He watches",
    core: `${BED}, one partner watching while the other has explicit sex with a lover, cuckold/voyeur composition, ${EXPLICIT}`,
    lock: "watcher visible in frame, sex act primary focus",
  },
  {
    id: "mmf",
    title: "MMF",
    core: `${BED}, two men and one woman in explicit threesome, double attention on her, clear sexual contact, ${EXPLICIT}`,
    lock: `${ANATOMY_LOCK}, three distinct people`,
  },
  {
    id: "double",
    title: "Double",
    core: `${BED}, double penetration, two penises entering the same partner, ${EXPLICIT}`,
    lock: `${ANATOMY_LOCK}, clear DP geometry`,
  },
  {
    id: "doggystyle-double",
    title: "Doggystyle Double Penis",
    core: `${BED}, doggy style with double penetration from behind, ${EXPLICIT}`,
    lock: `${ANATOMY_LOCK}, rear entry, both insertions visible if framing allows`,
  },
  {
    id: "ffm",
    title: "FFM",
    core: `${BED}, two women and one man in explicit threesome, ${EXPLICIT}`,
    lock: `${ANATOMY_LOCK}, three distinct people`,
  },
  {
    id: "pov-anal",
    title: "POV Anal",
    core: `${BED}, point-of-view anal sex, explicit anal penetration, ${EXPLICIT}`,
    lock: "POV camera angle, clear anal insertion",
  },
  {
    id: "hungry-oral",
    title: "Hungry oral",
    core: `${BED}, explicit oral sex, mouth on genitals, enthusiastic, ${EXPLICIT}`,
    lock: "clear oral contact, saliva, aroused anatomy",
  },
  // Location exceptions (title states not bed)
  {
    id: "romance-shower",
    title: "After Shower Couple",
    core: `in a shower or steamy bathroom, wet skin, couple in explicit sexual activity under water spray, ${EXPLICIT}`,
    lock: "wet bodies, bathroom tiles, not a dry bedroom portrait",
  },
];

/** Map alternate / legacy scene ids from the create page */
const ALIASES: Record<string, string> = {
  "erotic-missionary": "in-bed",
  "erotic-cowgirl": "in-bed",
  "spicy-ffm": "ffm",
  "spicy-mmf": "mmf",
  "spicy-dp": "double",
  "spicy-anal": "pov-anal",
  "romance-kiss": "in-bed",
  "romance-naked-together": "in-bed",
  "romance-undress": "in-bed",
  "romance-morning": "in-bed",
};

export function resolveSceneId(sceneId: string | null | undefined): string | null {
  if (!sceneId) return null;
  if (SCENE_CORES.some((s) => s.id === sceneId)) return sceneId;
  return ALIASES[sceneId] || sceneId;
}

export function getSceneCore(sceneId: string | null | undefined): SceneCore | null {
  const id = resolveSceneId(sceneId);
  if (!id) return null;
  return SCENE_CORES.find((s) => s.id === id) || null;
}

/**
 * Build final prompt + shared negatives for generation.
 * faceDescription / outfitDescription / role are optional context strings from the app.
 */
export function buildScenePrompt(
  sceneId: string | null | undefined,
  faceDescription?: string,
  outfitDescription?: string,
  role?: string
): { prompt: string; negative: string; title: string } {
  const core = getSceneCore(sceneId);
  const title = core?.title || sceneId || "Explicit scene";

  const parts: string[] = [];
  if (faceDescription?.trim()) parts.push(faceDescription.trim());
  if (role?.trim()) parts.push(`role focus: ${role.trim()}`);
  if (outfitDescription?.trim()) {
    parts.push(`outfit reference: ${outfitDescription.trim()}`);
  } else if (core) {
    parts.push("nude or minimal clothing during the act");
  }

  if (core) {
    parts.push(core.core);
    if (core.lock) parts.push(core.lock);
  } else {
    // Default After Dark if unknown id: bed + full explicit
    parts.push(
      `${BED}, full explicit sexual activity matching the scene title "${title}", ${EXPLICIT}, ${ANATOMY_LOCK}`
    );
  }

  parts.push(ANATOMY_LOCK);
  parts.push("photorealistic, highly detailed");

  const prompt = parts.filter(Boolean).join(", ");
  const negative = SHARED_NEG;

  return { prompt, negative, title };
}

export const SHARED_NEGATIVES = SHARED_NEG;
