/** The Other Room — private album types */

export type Intensity = "soft" | "playful" | "after_dark";
export type StillStatus = "preview" | "kept" | "discarded";
export type StillVisibility = "both" | "hidden_from_partner";
export type AlbumKind = "soft" | "playful" | "after_dark" | "custom";

export interface StudioMember {
  userId: string;
  role: "owner" | "partner";
}

export interface Studio {
  id: string;
  members: StudioMember[];
}

export interface Album {
  id: string;
  studioId: string;
  name: string;
  kind: AlbumKind;
  coverStillId?: string | null;
  createdBy: string;
  hiddenFor: string[];
  createdAt: string;
}

export interface Scene {
  id: string;
  studioId: string;
  intensity: Intensity;
  locationId: string;
  status: "pending" | "succeeded" | "failed";
  createdBy: string;
  createdAt: string;
}

export interface Still {
  id: string;
  sceneId: string;
  studioId: string;
  albumId: string | null;
  status: StillStatus;
  visibility: StillVisibility;
  storageKey: string;
  createdBy: string;
  favoriteBy: string[];
  expiresAt: string | null;
  createdAt: string;
}

export interface KeepBody {
  albumId?: string;
  visibility?: StillVisibility;
}

export interface CreateSceneBody {
  intensity?: Intensity;
  locationId?: string;
  prompt?: string;
}
