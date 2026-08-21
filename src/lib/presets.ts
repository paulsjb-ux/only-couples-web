export type LoverPreset = {
  id: string;
  sex: "f" | "m";
  name: string;
  age: string;
  body_shape: string;
  breasts?: string;
  penis?: string;
  look: string;
};

export const WOMAN_PRESETS: LoverPreset[] = [
  {
    id: "w-soft-brunette",
    sex: "f",
    name: "Wavy brunette",
    age: "30s",
    body_shape: "slim",
    breasts: "medium",
    look: "a different woman from the wife: olive-skinned woman in her 30s, long wavy dark brown hair, brown eyes, defined brows, slim, warm Mediterranean look",
  },
  {
    id: "w-curvy-redhead",
    sex: "f",
    name: "Natural redhead",
    age: "20s",
    body_shape: "average",
    breasts: "medium",
    look: "a different woman from the wife: natural redhead in her 20s, long wavy copper hair, fair skin, freckles, green eyes, average figure",
  },
  {
    id: "w-athletic-blonde",
    sex: "f",
    name: "Honey blonde",
    age: "20s",
    body_shape: "slim",
    breasts: "medium",
    look: "a different woman from the wife: woman in her 20s, long wavy honey-blonde hair, blue eyes, fair skin, slim, not tanned, not athletic",
  },
  {
    id: "w-silver-elegant",
    sex: "f",
    name: "Straight black hair",
    age: "20s",
    body_shape: "slim",
    breasts: "medium",
    look: "a different woman from the wife: South Asian woman in her 20s, long straight black hair, brown eyes, warm medium-brown skin, slim, not silver-haired",
  },
  {
    id: "w-full-dark",
    sex: "f",
    name: "Short coils",
    age: "20s",
    body_shape: "slim",
    breasts: "small",
    look: "a different woman from the wife: Black woman in her 20s, short natural black coils, deep brown skin, slim face and neck, not a full or heavy figure",
  },
  {
    id: "w-petite-ink",
    sex: "f",
    name: "Petite dark hair",
    age: "20s",
    body_shape: "slim",
    breasts: "small",
    look: "a different woman from the wife: East Asian woman in her 20s, long straight black hair, brown eyes, light skin, slim, petite",
  },
];

export const MAN_PRESETS: LoverPreset[] = [
  {
    id: "m-silver-fox",
    sex: "m",
    name: "Fair 30s",
    age: "30s",
    body_shape: "average",
    penis: "average",
    look: "a different man from the husband: light-skinned man in his 30s, short light-brown hair, blue eyes, clean shaven, average build, not silver-haired",
  },
  {
    id: "m-bearded-fit",
    sex: "m",
    name: "Curly beard",
    age: "30s",
    body_shape: "average",
    penis: "large",
    look: "a different man from the husband: man in his 30s, tight dark curls, full dark beard, brown eyes, olive skin, average build",
  },
  {
    id: "m-tall-slim",
    sex: "m",
    name: "East Asian 30s",
    age: "30s",
    body_shape: "slim",
    penis: "average",
    look: "a different man from the husband: East Asian man in his 30s, short black hair, clean shaven, slim, light skin, not light-brown hair",
  },
  {
    id: "m-broad-40",
    sex: "m",
    name: "Dark-skinned 30s",
    age: "30s",
    body_shape: "athletic",
    penis: "large",
    look: "a different man from the husband: Black man in his 30s, short black hair, clean shaven, defined jaw, athletic not heavy, not a 40s midsection",
  },
  {
    id: "m-dark-30",
    sex: "m",
    name: "Dark-haired 30s",
    age: "30s",
    body_shape: "average",
    penis: "average",
    look: "a different man from the husband: man in his 30s, dark wavy hair, short stubble, brown eyes, olive-tan skin, average build",
  },
  {
    id: "m-distinguished",
    sex: "m",
    name: "Blond 30s",
    age: "30s",
    body_shape: "athletic",
    penis: "average",
    look: "a different man from the husband: fair-haired man in his 30s, short blond hair, blue eyes, clean shaven, athletic, not 60s, not white-haired",
  },
];

export const ALL_PRESETS = [...WOMAN_PRESETS, ...MAN_PRESETS];

export function getPreset(id: string) {
  return ALL_PRESETS.find((p) => p.id === id) || null;
}
