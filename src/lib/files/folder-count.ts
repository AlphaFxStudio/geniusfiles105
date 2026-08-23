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
import { mockResolve, toAbsolutePath } from "./fs";
import type { PathRef } from "./types";

const cache = new Map<string, number>();
const inflight = new Map<string, Promise<number | null>>();

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
          queue.shift()?.();
        });
    };
    if (running < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

function keyOf(parent: PathRef, name: string): string {
  return `${parent.rootId}:${[...parent.segments, name].join("/")}`;
}

async function resolveCount(parent: PathRef, name: string): Promise<number | null> {
  if (isAndroidNative()) {
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

/** Invalidate cached counts (after a mutation inside `parent`). */
export function invalidateFolderCounts(parent?: PathRef) {
  if (!parent) {
    cache.clear();
    return;
  }
  const prefix = `${parent.rootId}:${parent.segments.join("/")}`;
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}

/**
 * Returns the child count of a folder, or `null` while unknown.
 * Non-directories and missing parents resolve to `null` without any work.
 */
export function useFolderCount(parent: PathRef | null | undefined, name: string, enabled: boolean) {
  const key = parent && enabled ? keyOf(parent, name) : null;
  const [count, setCount] = useState<number | null>(() => (key ? (cache.get(key) ?? null) : null));

  useEffect(() => {
    if (!key || !parent) return;
    const cached = cache.get(key);
    if (cached != null) {
      setCount(cached);
      return;
    }
    let alive = true;
    let pending = inflight.get(key);
    if (!pending) {
      pending = schedule(() => resolveCount(parent, name));
      inflight.set(key, pending);
      void pending.finally(() => inflight.delete(key));
    }
    void pending.then((value) => {
      if (value != null) cache.set(key, value);
      if (alive) setCount(value);
    });
    return () => {
      alive = false;
    };
    // `parent`/`name` are fully encoded by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return count;
}
