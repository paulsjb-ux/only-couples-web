import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import type { MediaRef } from "../data/outfit-integration";
import { pickMedia, type PickerSource } from "../lib/mediaPicker";

type Props = {
  outfit?: MediaRef;
  onChange: (outfit: MediaRef | undefined) => void;
};

export function OutfitSlot({ outfit, onChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  async function choose(source: PickerSource) {
    setMenuOpen(false);
    const picked = await pickMedia(source, "Outfit");
    if (picked) onChange(picked);
  }

  return (
    <View style={styles.block}>
      <Text style={styles.label}>OUTFIT</Text>
      <Text style={styles.hint}>Optional. Leave empty to use the scene default.</Text>

      {outfit ? (
        <View style={styles.row}>
          <Image source={{ uri: outfit.uri }} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.fileName}>{outfit.label ?? "Outfit selected"}</Text>
            <Pressable onPress={() => onChange(undefined)}>
              <Text style={styles.clear}>Clear outfit</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={() => setMenuOpen(true)}>
          <Text style={styles.addBtnText}>Add outfit photo</Text>
        </Pressable>
      )}

      <Modal visible={menuOpen} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={styles.sheet}>
            <Pressable style={styles.sheetItem} onPress={() => choose("library")}>
              <Text style={styles.sheetText}>Photo Library</Text>
            </Pressable>
            <Pressable style={styles.sheetItem} onPress={() => choose("camera")}>
              <Text style={styles.sheetText}>Take Photo</Text>
            </Pressable>
            <Pressable style={styles.sheetItem} onPress={() => choose("file")}>
              <Text style={styles.sheetText}>Choose File</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const BURGUNDY = "#7A3B3F";

const styles = StyleSheet.create({
  block: { marginTop: 20 },
  label: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: "#8A7A6A",
    fontWeight: "600",
    marginBottom: 4,
  },
  hint: { fontSize: 12, color: "#9A8B7B", marginBottom: 10 },
  addBtn: {
    backgroundColor: BURGUNDY,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnText: { color: "white", fontWeight: "600", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: "#EEE" },
  fileName: { fontSize: 14, color: "#333", marginBottom: 6 },
  clear: { color: BURGUNDY, fontSize: 14 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    padding: 32,
  },
  sheet: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 8,
  },
  sheetItem: { paddingVertical: 16, paddingHorizontal: 20 },
  sheetText: { fontSize: 17, color: "#222" },
});
