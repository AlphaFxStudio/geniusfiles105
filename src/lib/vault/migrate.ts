/**
 * Coffre-fort — migration des éléments ajoutés avant le chiffrement.
 *
 * Règle absolue : aucune perte de fichier. Pour chaque élément encore en
 * clair, on chiffre vers un NOUVEAU conteneur, on vérifie qu'il existe,
 * et seulement alors on supprime la version en clair. Si une étape
 * échoue, le fichier d'origine est conservé tel quel et l'élément reste
 * marqué non chiffré : il continue de fonctionner exactement comme avant.
 *
 * La migration s'exécute en arrière-plan après un déverrouillage réussi
 * (la clé maître est alors disponible), un élément à la fois, sans jamais
 * bloquer l'interface.
 */
import { nativePlugin } from "@/lib/native/geniusfiles-native";

import { ENCRYPTED_EXT, encryptFile, isFileCryptoAvailable } from "./file-crypto";
import { isMasterKeyLoaded } from "./crypto";
import { readItems, upsertItem } from "./store";
import type { VaultItem } from "./types";

let running = false;

function encryptedPathFor(item: VaultItem): string | null {
  const current = item.vaultAbsolutePath;
  if (!current) return null;
  const slash = current.lastIndexOf("/");
  const dir = slash > 0 ? current.slice(0, slash) : "";
  return `${dir}/${item.id}.${ENCRYPTED_EXT}`;
}

export type VaultMigrationResult = { migrated: number; pending: number };

/** Chiffre les éléments restés en clair. Sûr à appeler plusieurs fois. */
export async function migrateLegacyItems(): Promise<VaultMigrationResult> {
  if (running) return { migrated: 0, pending: 0 };
  if (!isFileCryptoAvailable() || !isMasterKeyLoaded()) return { migrated: 0, pending: 0 };
  const p = nativePlugin();
  if (!p) return { migrated: 0, pending: 0 };

  running = true;
  let migrated = 0;
  let pending = 0;
  try {
    const legacy = readItems().filter(
      (it) => !it.encrypted && !it.isDirectory && !!it.vaultAbsolutePath,
    );
    for (const item of legacy) {
      // Le verrouillage automatique peut survenir en plein travail :
      // on s'arrête proprement, la reprise aura lieu au prochain
      // déverrouillage.
      if (!isMasterKeyLoaded()) {
        pending += 1;
        break;
      }
      const source = item.vaultAbsolutePath as string;
      const destination = encryptedPathFor(item);
      if (!destination) {
        pending += 1;
        continue;
      }
      try {
        await encryptFile(source, destination);
        await p.stat({ path: destination }); // vérification réelle sur le disque
      } catch {
        // Échec du chiffrement : on nettoie l'ébauche, on garde l'original.
        try {
          await p.deletePath({ path: destination });
        } catch {
          /* ignore */
        }
        pending += 1;
        continue;
      }
      try {
        await p.deletePath({ path: source });
      } catch {
        // La version claire résiste : on préfère conserver l'ancien état
        // plutôt que de dupliquer le fichier.
        try {
          await p.deletePath({ path: destination });
        } catch {
          /* ignore */
        }
        pending += 1;
        continue;
      }
      upsertItem({
        ...item,
        vaultAbsolutePath: destination,
        encrypted: true,
        cipherAlgo: "AES-256-GCM",
      });
      migrated += 1;
    }
  } finally {
    running = false;
  }
  return { migrated, pending };
}

/** Nombre d'éléments encore stockés en clair (indicateur de transition). */
export function countLegacyItems(): number {
  return readItems().filter((it) => !it.encrypted && !it.isDirectory && !!it.vaultAbsolutePath)
    .length;
}
