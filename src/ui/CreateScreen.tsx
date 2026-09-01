import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  initialCreateState,
  setOutfit,
  setScene,
  type CreateScreenState,
  type MediaRef,
} from "../data/outfit-integration";
import { SCENE_CORES } from "../data/scene-cores-recode";
import { OutfitSlot } from "./OutfitSlot";
import { pickMedia } from "../lib/mediaPicker";
import { generateImages } from "../lib/generate";

const SCENE_IDS = Object.keys(SCENE_CORES);

export function CreateScreen() {
  const [state, setState] = useState<CreateScreenState>(initialCreateState);
  const [busy, setBusy] = useState(false);

  async function addFace() {
    const picked = await pickMedia("library", "Wife");
    if (!picked) return;
    setState((s) => ({
      ...s,
      cast: [...s.cast, { face: picked, role: "Wife" }],
    }));
  }

  function onOutfit(outfit: MediaRef | undefined) {
    setState((s) => setOutfit(s, outfit));
  }

  function onScene(sceneId: string) {
    setState((s) => setScene(s, sceneId));
  }

  function onVersions(n: 1 | 2 | 3 | 4) {
    setState((s) => ({ ...s, versions: n }));
  }

  async function onUseScene() {
    if (!state.cast.length) {
      Alert.alert("Add a face first");
      return;
    }
    if (!state.sceneId) {
      Alert.alert("Pick a scene first");
      return;
    }
    try {
      setBusy(true);
      const result = await generateImages(state);
      Alert.alert("Started", "Generation submitted.");
      return result;
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Generate failed"
      );
    } finally {
      setBusy(false);
    }
  }

  const face = state.cast[0]?.face;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.nav}>Face  ·  Outfit  ·  Scene  ·  Keep</Text>

      <Text style={styles.h1}>Create</Text>

      {/* FACE */}
      <Text style={styles.section}>FACE</Text>
      {face ? (
        <View>
          <Image source={{ uri: face.uri }} style={styles.face} />
          <Text style={styles.caption}>{state.cast[0].role ?? "Face"}</Text>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={addFace}>
          <Text style={styles.addBtnText}>Add face</Text>
        </Pressable>
      )}

      {/* OUTFIT — this is the new control */}
      <OutfitSlot outfit={state.outfit} onChange={onOutfit} />

      {/* SCENE */}
      <Text style={[styles.section, { marginTop: 24 }]}>SCENE</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {SCENE_IDS.map((id) => (
          <Pressable
            key={id}
            onPress={() => onScene(id)}
            style={[
              styles.chip,
              state.sceneId === id && styles.chipOn,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                state.sceneId === id && styles.chipTextOn,
              ]}
            >
              {id}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* VERSIONS */}
      <Text style={[styles.section, { marginTop: 24 }]}>VERSIONS</Text>
      <View style={styles.grid}>
        {([1, 2, 3, 4] as const).map((n) => (
          <Pressable
            key={n}
            onPress={() => onVersions(n)}
            style={[styles.ver, state.versions === n && styles.verOn]}
          >
            <Text style={[styles.verText, state.versions === n && styles.verTextOn]}>
              {["One", "Two", "Three", "Four"][n - 1]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        Each version is a separate image. You keep only the ones you want.
      </Text>

      <Pressable
        style={[styles.cta, busy && { opacity: 0.6 }]}
        onPress={onUseScene}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.ctaText}>Use this scene</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const BURGUNDY = "#7A3B3F";

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#FAF7F3" },
  content: { padding: 20, paddingBottom: 60 },
  nav: { color: "#B7A48E", fontSize: 14, marginBottom: 16 },
  h1: { fontSize: 28, fontWeight: "600", color: "#2A2A2A", marginBottom: 20 },
  section: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: "#8A7A6A",
    fontWeight: "600",
    marginBottom: 10,
  },
  face: { width: 88, height: 88, borderRadius: 16 },
  caption: { marginTop: 6, color: "#666", fontSize: 13 },
  addBtn: {
    backgroundColor: BURGUNDY,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnText: { color: "white", fontWeight: "600", fontSize: 16 },
  chip: {
    borderWidth: 1,
    borderColor: "#E4D8CC",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "white",
  },
  chipOn: { backgroundColor: BURGUNDY, borderColor: BURGUNDY },
  chipText: { fontSize: 12, color: "#333" },
  chipTextOn: { color: "white" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  ver: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#E4D8CC",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "white",
  },
  verOn: { backgroundColor: BURGUNDY, borderColor: BURGUNDY },
  verText: { fontSize: 16, color: "#333" },
  verTextOn: { color: "white" },
  hint: { marginTop: 10, color: "#9A8B7B", fontSize: 13 },
  cta: {
    marginTop: 24,
    backgroundColor: BURGUNDY,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: { color: "white", fontSize: 17, fontWeight: "600" },
});
