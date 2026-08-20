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
    name: "Soft brunette",
    age: "30s",
    body_shape: "slim",
    breasts: "medium",
    look: "a different woman from the wife: warm European brunette, shoulder-length dark brown hair, brown eyes, soft natural face, slim",
  },
  {
    id: "w-curvy-redhead",
    sex: "f",
    name: "Curvy redhead",
    age: "40s",
    body_shape: "curvy",
    breasts: "full",
    look: "a different woman from the wife: natural redhead, fair skin, freckles, green eyes, curvy hips, full figure, 40s",
  },
  {
    id: "w-athletic-blonde",
    sex: "f",
    name: "Athletic blonde",
    age: "20s",
    body_shape: "athletic",
    breasts: "small",
    look: "a different woman from the wife: athletic blonde, tanned, short-to-medium hair, fit shoulders, small natural breasts, 20s",
  },
  {
    id: "w-silver-elegant",
    sex: "f",
    name: "Silver elegant",
    age: "50s",
    body_shape: "average",
    breasts: "medium",
    look: "a different woman from the wife: elegant woman in her 50s, silver-blonde bob, defined cheekbones, poised, average figure",
  },
  {
    id: "w-full-dark",
    sex: "f",
    name: "Full dark hair",
    age: "30s",
    body_shape: "full",
    breasts: "large",
    look: "a different woman from the wife: deep brown skin, dark coiled hair, full soft body, large natural breasts, warm expression, 30s",
  },
  {
    id: "w-petite-ink",
    sex: "f",
    name: "Petite dark hair",
    age: "20s",
    body_shape: "slim",
    breasts: "small",
    look: "a different woman from the wife: petite East Asian woman, straight black hair, slim, small natural breasts, 20s",
  },
];

export const MAN_PRESETS: LoverPreset[] = [
  {
    id: "m-silver-fox",
    sex: "m",
    name: "Silver fox",
    age: "50s",
    body_shape: "average",
    penis: "average",
    look: "a different man from the husband: silver-haired man in his 50s, trimmed beard, average build, calm face",
  },
  {
    id: "m-bearded-fit",
    sex: "m",
    name: "Bearded athletic",
    age: "30s",
    body_shape: "athletic",
    penis: "large",
    look: "a different man from the husband: athletic man in his 30s, full dark beard, short hair, defined arms, not a gym poster",
  },
  {
    id: "m-tall-slim",
    sex: "m",
    name: "Tall slim",
    age: "20s",
    body_shape: "slim",
    penis: "average",
    look: "a different man from the husband: tall slim man in his 20s, light brown hair, clean shaven, narrow build",
  },
  {
    id: "m-broad-40",
    sex: "m",
    name: "Broad 40s",
    age: "40s",
    body_shape: "large",
    penis: "large",
    look: "a different man from the husband: broad man in his 40s, heavy chest and midsection, short dark hair, stubble, large frame",
  },
  {
    id: "m-dark-30",
    sex: "m",
    name: "Dark-haired 30s",
    age: "30s",
    body_shape: "average",
    penis: "average",
    look: "a different man from the husband: Mediterranean-looking man in his 30s, dark hair, olive skin, average build, short beard",
  },
  {
    id: "m-distinguished",
    sex: "m",
    name: "Distinguished 60s",
    age: "60s",
    body_shape: "heavy",
    penis: "average",
    look: "a different man from the husband: distinguished man in his 60s, white hair, lined face, heavier body, not athletic",
  },
];

export const ALL_PRESETS = [...WOMAN_PRESETS, ...MAN_PRESETS];

export function getPreset(id: string) {
  return ALL_PRESETS.find((p) => p.id === id) || null;
}
