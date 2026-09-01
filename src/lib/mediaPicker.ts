import type { MediaRef } from "../data/outfit-integration";

export type PickerSource = "library" | "camera" | "file";

export async function pickMedia(
  source: PickerSource,
  label?: string
): Promise<MediaRef | null> {
  if (typeof document === "undefined") return null;

  const file = await new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (source === "camera") input.setAttribute("capture", "environment");

    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });

  if (!file) return null;
  return {
    id: "media-" + Date.now(),
    uri: URL.createObjectURL(file),
    label: label || file.name,
  };
}
