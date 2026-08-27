/**
 * Arrière-plan du lecteur audio plein écran.
 *
 * L'utilisateur choisit une ambiance parmi quelques visuels fournis, une
 * image de sa galerie, ou aucun fond. Le choix est persisté localement et
 * partagé par toutes les vues via `useSyncExternalStore`, sans jamais
 * dépendre du cycle de vie du lecteur (changer de fond n'interrompt pas
 * la lecture).
 */
import { useSyncExternalStore } from "react";

import concert from "@/assets/player-bg-concert.jpg";
import nature from "@/assets/player-bg-nature.jpg";
import city from "@/assets/player-bg-city.jpg";
import abstractBg from "@/assets/player-bg-abstract.jpg";

export type PlayerBackgroundId = "none" | "abstract" | "concert" | "nature" | "city" | "custom";

export type PlayerBackgroundPreset = {
  id: Exclude<PlayerBackgroundId, "custom" | "none">;
  url: string;
  labelKey: string;
};

export const PLAYER_BACKGROUNDS: PlayerBackgroundPreset[] = [
  { id: "abstract", url: abstractBg, labelKey: "media.player.bg.abstract" },
  { id: "concert", url: concert, labelKey: "media.player.bg.concert" },
  { id: "nature", url: nature, labelKey: "media.player.bg.nature" },
  { id: "city", url: city, labelKey: "media.player.bg.city" },
];

const KEY = "gf.player.background.v1";
const CUSTOM_KEY = "gf.player.background.custom.v1";
/** Largeur maximale de l'image importée : suffisant en plein écran, léger en stockage. */
const CUSTOM_MAX_WIDTH = 820;

type Snapshot = { id: PlayerBackgroundId; custom: string | null };

let snapshot: Snapshot = { id: "abstract", custom: null };
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const id = window.localStorage.getItem(KEY) as PlayerBackgroundId | null;
    const custom = window.localStorage.getItem(CUSTOM_KEY);
    snapshot = {
      id: id ?? "abstract",
      custom: custom && custom.startsWith("data:") ? custom : null,
    };
    if (snapshot.id === "custom" && !snapshot.custom) snapshot = { ...snapshot, id: "abstract" };
  } catch {
    /* ignore */
  }
}

function emit() {
  for (const fn of listeners) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
}

export function getPlayerBackground(): Snapshot {
  hydrate();
  return snapshot;
}

export function setPlayerBackground(id: PlayerBackgroundId) {
  hydrate();
  if (id === "custom" && !snapshot.custom) return;
  snapshot = { ...snapshot, id };
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
  emit();
}

/** URL réellement affichée derrière le lecteur (`null` = aucun fond). */
export function playerBackgroundUrl(s: Snapshot = getPlayerBackground()): string | null {
  if (s.id === "none") return null;
  if (s.id === "custom") return s.custom;
  return PLAYER_BACKGROUNDS.find((p) => p.id === s.id)?.url ?? null;
}

/** Importe une image de l'appareil, redimensionnée puis persistée en JPEG. */
export async function importCustomBackground(file: File): Promise<boolean> {
  try {
    const dataUrl = await downscale(file);
    if (!dataUrl) return false;
    hydrate();
    snapshot = { id: "custom", custom: dataUrl };
    window.localStorage.setItem(CUSTOM_KEY, dataUrl);
    window.localStorage.setItem(KEY, "custom");
    emit();
    return true;
  } catch {
    return false;
  }
}

async function downscale(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });
    const scale = Math.min(1, CUSTOM_MAX_WIDTH / (img.naturalWidth || CUSTOM_MAX_WIDTH));
    const w = Math.max(1, Math.round((img.naturalWidth || CUSTOM_MAX_WIDTH) * scale));
    const h = Math.max(1, Math.round((img.naturalHeight || CUSTOM_MAX_WIDTH) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function usePlayerBackground(): Snapshot {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => getPlayerBackground(),
    () => getPlayerBackground(),
  );
}
