/**
 * Loads src/prompts/* and builds location + negative + anatomy locks
 * for /api/generate. Soft default is bedroom_morning — never shower unless asked.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

export type LocationEntry = {
  id: string;
  intensity?: string[];
  label?: string;
  prompt: string;
  optional?: boolean;
  notes?: string;
};

type LocationsFile = {
  default_location_id?: string;
  locations?: LocationEntry[];
};

function promptsDir() {
  // Prefer src/prompts next to project root
  const candidates = [
    join(process.cwd(), "src", "prompts"),
    join(process.cwd(), "prompts"),
  ];
  for (const d of candidates) {
    if (existsSync(d)) return d;
  }
  return join(process.cwd(), "src", "prompts");
}

function readText(name: string): string {
  const path = join(promptsDir(), name);
  if (!existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function readJson<T>(name: string): T | null {
  const raw = readText(name);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getGlobalNegatives(): string {
  return readText("global-negatives.txt")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .join(", ");
}

export function getTwoPersonAnatomy(): { positive: string; negative: string } {
  const raw = readText("anatomy-two-person.txt");
  const lines = raw.split("\n").map((l) => l.trim());
  let mode: "pos" | "neg" | null = null;
  const pos: string[] = [];
  const neg: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith("#")) {
      if (/positive/i.test(line)) mode = "pos";
      if (/negative/i.test(line)) mode = "neg";
      continue;
    }
    if (mode === "pos") pos.push(line);
    else if (mode === "neg") neg.push(line);
  }
  return {
    positive: pos.join(", ") ||
      "exactly two people, one man and one woman, two distinct bodies, two faces only, correct human anatomy",
    negative: neg.join(", ") ||
      "third person, extra limbs, fused bodies, bad anatomy, deformed hands",
  };
}

export function getSoftHeroTemplate(): {
  positive?: string;
  negative_extra?: string;
  location_id?: string;
} | null {
  return readJson("soft-hero-template.json");
}

export function resolveLocation(
  locationId: string | undefined,
  sceneId: string,
  sceneName: string
): { id: string; prompt: string; allowShower: boolean } {
  const file = readJson<LocationsFile>("locations.json");
  const locations = file?.locations || [];
  const defaultId = file?.default_location_id || "bedroom_morning";

  const sceneHints = `${sceneId} ${sceneName}`.toLowerCase();
  const allowShower =
    /\bshower\b/.test(sceneHints) ||
    /\bbathroom\b/.test(sceneHints) ||
    locationId === "shower";

  let id = locationId || defaultId;
  if (!allowShower && id === "shower") {
    id = defaultId;
  }

  const entry =
    locations.find((l) => l.id === id) ||
    locations.find((l) => l.id === defaultId);

  const prompt =
    entry?.prompt ||
    "soft morning light in a quiet bedroom, linen sheets, warm intimate indoor light, private domestic setting — not a bathroom or shower";

  return { id: entry?.id || defaultId, prompt, allowShower };
}

/**
 * Extra positive + negative fragments to append to every generate prompt.
 */
export function buildPromptRules(opts: {
  sceneId: string;
  sceneName: string;
  locationId?: string;
  personCount: number;
  isSoftHero?: boolean;
}): { locationLine: string; anatomyPositive: string; negativeLine: string } {
  const loc = resolveLocation(opts.locationId, opts.sceneId, opts.sceneName);
  const anatomy = getTwoPersonAnatomy();
  const globalNeg = getGlobalNegatives();
  const soft = opts.isSoftHero ? getSoftHeroTemplate() : null;

  let locationLine = `LOCATION LOCK: ${loc.prompt}. Stay in this setting.`;
  if (!loc.allowShower) {
    locationLine +=
      " Do NOT place the scene in a shower, bathroom, or wet tiled room unless the scene title requires it.";
  }

  let anatomyPositive = "";
  if (opts.personCount >= 2) {
    anatomyPositive = `ANATOMY LOCK (two people): ${anatomy.positive}.`;
  }

  const negParts = [globalNeg];
  if (opts.personCount >= 2) negParts.push(anatomy.negative);
  if (soft?.negative_extra) negParts.push(soft.negative_extra);
  if (!loc.allowShower) {
    negParts.push(
      "shower, bathroom, wet tiles, steam, shower head, bathtub, tiled wall"
    );
  }

  // Zen "by_prompt" may not have a separate negative field — fold into prompt
  const negativeLine = `AVOID: ${negParts.filter(Boolean).join(", ")}.`;

  if (opts.isSoftHero && soft?.positive) {
    locationLine = `SOFT HERO: ${soft.positive}. ${locationLine}`;
  }

  return { locationLine, anatomyPositive, negativeLine };
}
