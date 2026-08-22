/**
 * In-memory store for wiring keep/discard.
 * Replace methods with Prisma / Drizzle / Supabase + object storage.
 */

import type { Album, Scene, Still, StillVisibility } from "@/types/album";
import { randomUUID } from "crypto";

const albums = new Map<string, Album>();
const scenes = new Map<string, Scene>();
const stills = new Map<string, Still>();

/** Object keys marked for wipe (replace with S3 delete) */
const pendingWipes: string[] = [];

export const albumStore = {
  async getStill(id: string): Promise<Still | null> {
    return stills.get(id) ?? null;
  },

  async getAlbum(id: string): Promise<Album | null> {
    return albums.get(id) ?? null;
  },

  async listAlbumsForStudio(studioId: string, userId: string): Promise<Album[]> {
    return [...albums.values()].filter(
      (a) => a.studioId === studioId && !a.hiddenFor.includes(userId)
    );
  },

  async listKeptStills(
    albumId: string,
    userId: string,
    partnerId?: string
  ): Promise<Still[]> {
    return [...stills.values()].filter((s) => {
      if (s.albumId !== albumId || s.status !== "kept") return false;
      if (s.visibility === "hidden_from_partner" && s.createdBy !== userId) {
        return false;
      }
      return true;
    });
  },

  async ensureSoftAlbum(studioId: string, userId: string): Promise<Album> {
    const existing = [...albums.values()].find(
      (a) => a.studioId === studioId && a.kind === "soft"
    );
    if (existing) return existing;

    const album: Album = {
      id: randomUUID(),
      studioId,
      name: "Soft",
      kind: "soft",
      coverStillId: null,
      createdBy: userId,
      hiddenFor: [],
      createdAt: new Date().toISOString(),
    };
    albums.set(album.id, album);
    return album;
  },

  async createPreviewStill(input: {
    sceneId: string;
    studioId: string;
    createdBy: string;
    storageKey: string;
    ttlHours?: number;
  }): Promise<Still> {
    const ttl = input.ttlHours ?? 24;
    const still: Still = {
      id: randomUUID(),
      sceneId: input.sceneId,
      studioId: input.studioId,
      albumId: null,
      status: "preview",
      visibility: "both",
      storageKey: input.storageKey,
      createdBy: input.createdBy,
      favoriteBy: [],
      expiresAt: new Date(Date.now() + ttl * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    stills.set(still.id, still);
    return still;
  },

  async createScene(input: {
    studioId: string;
    intensity: Scene["intensity"];
    locationId: string;
    createdBy: string;
  }): Promise<Scene> {
    const scene: Scene = {
      id: randomUUID(),
      studioId: input.studioId,
      intensity: input.intensity,
      locationId: input.locationId,
      status: "succeeded",
      createdBy: input.createdBy,
      createdAt: new Date().toISOString(),
    };
    scenes.set(scene.id, scene);
    return scene;
  },

  /**
   * preview → kept. Assigns Soft album if albumId omitted.
   */
  async keepStill(
    stillId: string,
    userId: string,
    body: { albumId?: string; visibility?: StillVisibility }
  ): Promise<Still | { error: string; status: number }> {
    const still = stills.get(stillId);
    if (!still) return { error: "Still not found", status: 404 };
    if (still.status !== "preview") {
      return { error: "Only preview stills can be kept", status: 409 };
    }

    let albumId = body.albumId;
    if (!albumId) {
      const soft = await this.ensureSoftAlbum(still.studioId, userId);
      albumId = soft.id;
    } else {
      const album = albums.get(albumId);
      if (!album || album.studioId !== still.studioId) {
        return { error: "Album not found in studio", status: 400 };
      }
    }

    still.albumId = albumId;
    still.status = "kept";
    still.expiresAt = null;
    if (body.visibility) still.visibility = body.visibility;
    stills.set(still.id, still);
    return still;
  },

  /**
   * preview|kept → discarded + enqueue storage wipe.
   */
  async discardStill(
    stillId: string
  ): Promise<Still | { error: string; status: number }> {
    const still = stills.get(stillId);
    if (!still) return { error: "Still not found", status: 404 };
    if (still.status === "discarded") {
      return { error: "Already discarded", status: 409 };
    }

    still.status = "discarded";
    still.albumId = null;
    pendingWipes.push(still.storageKey);
    stills.set(still.id, still);

    // TODO: await storage.delete(still.storageKey)
    return still;
  },

  getPendingWipes(): string[] {
    return [...pendingWipes];
  },
};
