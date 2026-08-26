/**
 * Thin wrapper around expo-image-picker.
 * Swap this file if your app already has a picker.
 */

import * as ImagePicker from "expo-image-picker";
import type { MediaRef } from "../data/outfit-integration";

export type PickerSource = "library" | "camera" | "file";

export async function pickMedia(
  source: PickerSource,
  label?: string
): Promise<MediaRef | null> {
  if (source === "camera") {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return null;
    return toRef(result.assets[0].uri, label);
  }

  // library + file both use the image library
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (result.canceled || !result.assets[0]) return null;
  return toRef(result.assets[0].uri, label);
}

function toRef(uri: string, label?: string): MediaRef {
  return {
    id: `media-${Date.now()}`,
    uri,
    label,
  };
}
