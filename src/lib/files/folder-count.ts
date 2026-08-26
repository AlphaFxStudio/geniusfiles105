/**
 * Lazy folder item counts.
 *
 * Each visible folder row asks for the number of children it holds. Counts
 * are resolved asynchronously (native `statDirectory`, i.e. a single
 * `File.list().size` call) and memoised in a module-level cache so that
 * scrolling back and forth never re-hits the filesystem. In-flight requests
 * are de-duplicated, so a row that mounts twice costs one native call.
 *
 * Web preview falls back to the curated mock dataset.
 */
import { useEffect, useState } from "react";

import { isAndroidNative, nativePlugin } from "@/lib/native/geniusfiles-native";
import { peekCachedEntries } from "@/lib/native/dir-cache";
import { subscribeFsPatch, type FsPatchOp } from "@/lib/index/patches";
import { mockResolve, toAbsolutePath } from "./fs";
import type { PathRef, StorageRootId } from "./types";

const cache = new Map<string, number>();
const inflight = new Map<string, Promise<number | null>>();

/* ─────────────────────────────────────────────────────────────
   Persistance légère des compteurs.

   Sans elle, chaque démarrage à froid réaffiche « — » puis déclenche
   autant d'appels natifs qu'il y a de dossiers visibles. Le cache est
   versionné, borné et tolérant aux données corrompues.
   ───────────────────────────────────────────────────────────── */
const PERSIST_KEY = "gf.foldercount.v1";
const PERSIST_MAX = 600;
let hydrated = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Record<string, number>;
    if (!data || typeof data !== "object") return;
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "number" && Number.isFinite(v) && !cache.has(k)) cache.set(k, v);
    }
  } catch {
    /* données illisibles : on repart simplement à vide */
  }
}

function schedulePersist(): void {
  if (typeof window === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    try {
      const out: Record<string, number> = {};
      const keys = Array.from(cache.keys()).slice(-PERSIST_MAX);
      for (const k of keys) {
        const v = cache.get(k);
        if (typeof v === "number") out[k] = v;
      }
      window.localStorage.setItem(PERSIST_KEY, JSON.stringify(out));
    } catch {
      /* quota atteint : le cache mémoire reste opérationnel */
    }
  }, 1500);
}

function remember(key: string, value: number): void {
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > PERSIST_MAX * 2) {
    const first = cache.keys().next().value;
    if (first === undefined) break;
    cache.delete(first);
  }
  schedulePersist();
}

/* ─────────────────────────────────────────────────────────────
   Mise à jour immédiate à chaque mutation.

   Un fichier ajouté ou supprimé ajuste le compteur du dossier parent
   de ±1 sans le moindre appel natif : la liste affiche instantanément
   la bonne valeur, sans recalcul ni clignotement.
   ───────────────────────────────────────────────────────────── */
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function dirKey(rootId: StorageRootId, segments: string[]): string {
  return `${rootId}:${segments.join("/")}`;
}

function bump(key: string, delta: number): boolean {
  const current = cache.get(key);
  if (current == null) return false;
  remember(key, Math.max(0, current + delta));
  return true;
}

function applyPatch(patch: FsPatchOp): void {
  ensureHydrated();
  let touched = false;
  switch (patch.op) {
    case "create":
      touched = bump(dirKey(patch.rootId, patch.segments), 1);
      break;
    case "delete": {
      touched = bump(dirKey(patch.rootId, patch.segments), -1);
      // Le dossier supprimé n'a plus de compte connu.
      const own = dirKey(patch.rootId, [...patch.segments, patch.name]);
      if (cache.delete(own)) touched = true;
      break;
    }
    case "rename": {
      const from = dirKey(patch.rootId, [...patch.segments, patch.oldName]);
      const known = cache.get(from);
      if (known != null) {
        cache.delete(from);
        remember(dirKey(patch.rootId, [...patch.segments, patch.newName]), known);
        touched = true;
      }
      break;
    }
    case "move": {
      if (bump(dirKey(patch.fromRootId, patch.fromSegments), -1)) touched = true;
      if (bump(dirKey(patch.toRootId, patch.toSegments), 1)) touched = true;
      const from = dirKey(patch.fromRootId, [...patch.fromSegments, patch.fromName]);
      const known = cache.get(from);
      if (known != null) {
        cache.delete(from);
        remember(dirKey(patch.toRootId, [...patch.toSegments, patch.toName]), known);
        touched = true;
      }
      break;
    }
  }
  if (touched) notify();
}

if (typeof window !== "undefined") subscribeFsPatch(applyPatch);

/**
 * File d'attente à concurrence limitée : le comptage des dossiers passe par
 * le pont natif, et une liste qui défile pouvait en déclencher des dizaines
 * simultanément — ce qui saturait le pont et retardait les interactions.
 * Trois requêtes en vol suffisent à remplir l'écran sans jamais gêner le
 * défilement ni les actions de l'utilisateur.
 */
const MAX_CONCURRENT = 3;
let running = 0;
const queue: Array<() => void> = [];

function schedule<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const run = () => {
      running++;
      task()
        .then(resolve, reject)
        .finally(() => {
          running--;
          // Dernier arrivé, premier servi : les lignes visibles après un
          // défilement rapide obtiennent leur compte avant celles déjà
          // sorties de l'écran.
          queue.pop()?.();
        });
    };
    if (running < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

function keyOf(parent: PathRef, name: string): string {
  return `${parent.rootId}:${[...parent.segments, name].join("/")}`;
}

/**
 * Compte connu sans aucun appel natif : quand le sous-dossier est déjà
 * dans le cache de dossiers (préchauffé ou visité), son nombre d'éléments
 * est déductible immédiatement.
 */
function peekCount(parent: PathRef, name: string): number | null {
  if (!isAndroidNative()) return null;
  const cached = peekCachedEntries(`${toAbsolutePath(parent)}/${name}`);
  return cached ? cached.length : null;
}

async function resolveCount(parent: PathRef, name: string): Promise<number | null> {
  if (isAndroidNative()) {
    const known = peekCount(parent, name);
    if (known != null) return known;
    const p = nativePlugin();
    if (!p?.statDirectory) return null;
    try {
      const res = await p.statDirectory({ path: `${toAbsolutePath(parent)}/${name}` });
      return typeof res?.count === "number" ? res.count : null;
    } catch {
      return null;
    }
  }
  const node = mockResolve({ rootId: parent.rootId, segments: [...parent.segments, name] });
  return node ? (node.children?.length ?? 0) : null;
}

/**
 * Invalide les compteurs (dernier recours : opérations groupées dont le
 * détail n'est pas connu). Les mutations ordinaires passent par le bus de
 * patchs et ajustent la valeur sans jamais forcer de recalcul.
 */
export function invalidateFolderCounts(parent?: PathRef) {
  ensureHydrated();
  if (!parent) {
    cache.clear();
    schedulePersist();
    notify();
    return;
  }
  const prefix = `${parent.rootId}:${parent.segments.join("/")}`;
  for (const k of Array.from(cache.keys())) if (k.startsWith(prefix)) cache.delete(k);
  schedulePersist();
  notify();
}

/**
 * Returns the child count of a folder, or `null` while unknown.
 * Non-directories and missing parents resolve to `null` without any work.
 */
export function useFolderCount(parent: PathRef | null | undefined, name: string, enabled: boolean) {
  const key = parent && enabled ? keyOf(parent, name) : null;
  /* Premier rendu : compte déjà connu (cache mémoire ou dossier déjà lu)
     affiché immédiatement, sans le moindre aller-retour natif. */
  const [count, setCount] = useState<number | null>(() => {
    if (!key || !parent) return null;
    ensureHydrated();
    const known = cache.get(key);
    if (known != null) return known;
    const peeked = peekCount(parent, name);
    if (peeked != null) remember(key, peeked);
    return peeked;
  });

  useEffect(() => {
    if (!key || !parent) return;
    ensureHydrated();
    let alive = true;

    /* Les mutations (ajout, suppression, déplacement) ajustent le cache :
       la ligne reflète le nouveau nombre immédiatement, sans relecture. */
    const sync = () => {
      const value = cache.get(key);
      if (alive && value != null) setCount(value);
    };
    listeners.add(sync);

    const cached = cache.get(key) ?? peekCount(parent, name);
    if (cached != null) {
      remember(key, cached);
      setCount(cached);
      return () => {
        alive = false;
        listeners.delete(sync);
      };
    }

    let pending = inflight.get(key);
    if (!pending) {
      pending = schedule(() => resolveCount(parent, name));
      inflight.set(key, pending);
      void pending.finally(() => inflight.delete(key));
    }
    void pending.then((value) => {
      if (value != null) remember(key, value);
      if (alive) setCount(value);
    });
    return () => {
      alive = false;
      listeners.delete(sync);
    };
    // `parent`/`name` are fully encoded by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return count;
}
