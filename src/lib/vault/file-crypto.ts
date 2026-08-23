/**
 * Coffre-fort — chiffrement / déchiffrement des fichiers (Android).
 *
 * Toutes les opérations passent par le pont natif `GeniusFilesNative`, qui
 * traite le fichier en flux (blocs de 1 Mo, AES-256-GCM avec IV aléatoire
 * par bloc). Aucun octet de fichier ne traverse la couche JavaScript : la
 * mémoire de la WebView reste stable même pour une vidéo de plusieurs Go.
 *
 * La clé maître est fournie par `crypto.ts` et n'existe qu'en mémoire
 * pendant que le coffre-fort est déverrouillé. Une fois verrouillé,
 * `sweepVaultTemp()` supprime les copies temporaires déchiffrées.
 */
import { isAndroidNative, nativePlugin } from "@/lib/native/geniusfiles-native";

import { masterKeyBase64 } from "./crypto";

/** Extension des conteneurs chiffrés du coffre-fort. */
export const ENCRYPTED_EXT = "gfenc";

export class VaultCryptoError extends Error {}

function requireKey(): string {
  const key = masterKeyBase64();
  if (!key) throw new VaultCryptoError("VAULT_LOCKED");
  return key;
}

/** Le chiffrement natif est-il réellement disponible sur cet appareil ? */
export function isFileCryptoAvailable(): boolean {
  if (!isAndroidNative()) return false;
  const p = nativePlugin();
  return typeof p?.vaultEncryptFile === "function" && typeof p?.vaultDecryptFile === "function";
}

/** Chiffre `source` vers `destination` (conteneur .gfenc). */
export async function encryptFile(source: string, destination: string): Promise<number> {
  const p = nativePlugin();
  if (!p?.vaultEncryptFile) throw new VaultCryptoError("CRYPTO_UNAVAILABLE");
  const res = await p.vaultEncryptFile({
    source,
    destination,
    keyBase64: requireKey(),
    overwrite: false,
  });
  return res?.size ?? 0;
}

/** Déchiffre un conteneur vers `destination` en clair. */
export async function decryptFile(
  source: string,
  destination: string,
  overwrite = false,
): Promise<number> {
  const p = nativePlugin();
  if (!p?.vaultDecryptFile) throw new VaultCryptoError("CRYPTO_UNAVAILABLE");
  const res = await p.vaultDecryptFile({
    source,
    destination,
    keyBase64: requireKey(),
    overwrite,
  });
  return res?.size ?? 0;
}

/**
 * Déchiffre un élément du coffre-fort dans le cache privé de
 * l'application, uniquement le temps de sa consultation. Le fichier
 * rendu est supprimé par `releaseTemp()` ou `sweepVaultTemp()`.
 */
export async function decryptToTemp(
  vaultPath: string,
  displayName: string,
): Promise<string | null> {
  const p = nativePlugin();
  if (!p?.vaultTempPath || !p?.vaultDecryptFile) return null;
  const { path } = await p.vaultTempPath({ name: displayName });
  await decryptFile(vaultPath, path, true);
  return path;
}

/** Supprime une copie temporaire dès qu'elle n'est plus nécessaire. */
export async function releaseTemp(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const p = nativePlugin();
  if (!p) return;
  try {
    await p.deletePath({ path });
  } catch {
    /* le balayage global s'en chargera */
  }
}

/** Purge complète du cache temporaire du coffre-fort (au verrouillage). */
export async function sweepVaultTemp(): Promise<void> {
  const p = nativePlugin();
  if (!p?.vaultClearTemp) return;
  try {
    await p.vaultClearTemp();
  } catch {
    /* meilleur effort */
  }
}
