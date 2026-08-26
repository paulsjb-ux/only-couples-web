import type { OutfitPreset } from "./presets";

/**
 * THIS is the list the app actually renders.
 * imageUrl must match a real file under /public
 *
 * After dark files currently in the repo:
 *   public/outfits/afterdark/IMG_7381.JPG
 *   public/outfits/afterdark/IMG_7472.jpg
 *   public/outfits/afterdark/IMG_7473.jpg
 *
 * Soft / playful still use the intended names.
 * If those JPGs are missing, add them or change imageUrl to the real filename.
 */
export const OUTFIT_PRESETS: OutfitPreset[] = [
  {
    id: "soft-silk-slip",
    tab: "soft",
    label: "Silk slip",
    imageUrl: "/outfits/soft/silk-slip.jpg",
  },
  {
    id: "soft-white-robe",
    tab: "soft",
    label: "White robe",
    imageUrl: "/outfits/soft/white-robe.jpg",
  },
  {
    id: "soft-lace-set",
    tab: "soft",
    label: "Soft lace",
    imageUrl: "/outfits/soft/soft-lace.jpg",
  },
  {
    id: "playful-lace-body",
    tab: "playful",
    label: "Lace body",
    imageUrl: "/outfits/playful/lace-body.jpg",
  },
  {
    id: "playful-satin-cami",
    tab: "playful",
    label: "Satin cami",
    imageUrl: "/outfits/playful/satin-cami.jpg",
  },
  {
    id: "playful-sheer-blouse",
    tab: "playful",
    label: "Sheer blouse",
    imageUrl: "/outfits/playful/sheer-blouse.jpg",
  },
  {
    id: "afterdark-7381",
    tab: "afterdark",
    label: "After dark 1",
    imageUrl: "/outfits/afterdark/IMG_7381.JPG",
  },
  {
    id: "afterdark-7472",
    tab: "afterdark",
    label: "After dark 2",
    imageUrl: "/outfits/afterdark/IMG_7472.jpg",
  },
  {
    id: "afterdark-7473",
    tab: "afterdark",
    label: "After dark 3",
    imageUrl: "/outfits/afterdark/IMG_7473.jpg",
  },
];
