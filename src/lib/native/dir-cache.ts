/**
 * mtime-based directory cache.
 *
 * Wraps the native `listDirectory` bridge so repeat opens of the same
 * folder are instantaneous. A cheap `statDirectory` call verifies the
 * directory's own mtime + entry count before we return cached data;
 * we only re-list when Android reports the folder actually changed.
 *
 * This is the primitive that lets Galerie/Nettoyeur/Explorateur stop
 * re-scanning the whole device on every app resume.
 */
import type { NativeDirEntry, NativeListing } from "./geniusfiles-native";
import { listNativeDirectory, nativePlugin } from "./geniusfiles-native";

type Entry = { mtime: number; count: number; entries: NativeDirEntry[]; at: number };

const MAX_ENTRIES = 128; // LRU cap — plenty for typical navigation depth
const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<CachedListing>>();

/* ─────────────────────────────────────────────────────────────
   Persistance légère (démarrage à froid).

   Le cache mémoire disparaît quand Android tue le processus : la
   première ouverture du gestionnaire repartait alors sur une lecture
   disque complète, d'où le long squelette « page Web en cours de
   chargement ». On conserve donc les derniers dossiers consultés dans
   le stockage local : au démarrage suivant, la liste est peinte au
   premier frame et la lecture réelle ne fait que revalider derrière.

   Volontairement borné (peu de dossiers, listes courtes) : aucune
   pression mémoire ni écriture disque notable, donc aucun impact sur
   la batterie.
   ───────────────────────────────────────────────────────────── */
const PERSIST_KEY = "gf.dircache.v1";
const PERSIST_MAX_DIRS = 48;
const PERSIST_MAX_ENTRIES_PER_DIR = 1500;
let hydrated = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

type PersistedDir = { path: string; mtime: number; count: number; entries: NativeDirEntry[] };

function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const dirs = JSON.parse(raw) as PersistedDir[];
    if (!Array.isArray(dirs)) return;
    for (const d of dirs) {
      if (!d || typeof d.path !== "string" || !Array.isArray(d.entries)) continue;
      if (cache.has(d.path)) continue;
      cache.set(d.path, {
        mtime: d.mtime,
        count: d.count,
        entries: d.entries,
        at: 0, // plus ancien que tout ce qui est lu pendant la session
      });
    }
  } catch {
    /* stockage indisponible ou données corrompues : on repart à vide */
  }
}

function writePersisted(): void {
  if (typeof window === "undefined") return;
  try {
    const dirs: PersistedDir[] = [];
    // Les plus récemment utilisés sont en fin de Map.
    const keys = Array.from(cache.keys()).reverse();
    for (const key of keys) {
      if (dirs.length >= PERSIST_MAX_DIRS) break;
      const e = cache.get(key);
      if (!e || e.entries.length > PERSIST_MAX_ENTRIES_PER_DIR) continue;
      dirs.push({ path: key, mtime: e.mtime, count: e.count, entries: e.entries });
    }
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(dirs));
  } catch {
    /* quota atteint : le cache mémoire reste pleinement fonctionnel */
  }
}

/** Écriture différée et regroupée, pendant les temps morts. */
function schedulePersist(): void {
  if (typeof window === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => void })
      .requestIdleCallback;
    if (ric) ric(writePersisted);
    else writePersisted();
  }, 1200);
}

if (typeof window !== "undefined") {
  // Mise en arrière-plan : on fige l'état courant sans attendre le délai.
  window.addEventListener("pagehide", () => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = null;
    writePersisted();
  });
}

function touch(path: string, entry: Entry) {
  cache.delete(path);
  cache.set(path, entry);
  while (cache.size > MAX_ENTRIES) {
    const first = cache.keys().next().value;
    if (first === undefined) break;
    cache.delete(first);
  }
  schedulePersist();
}

type StatResult =
  | { ok: true; mtime: number; count: number }
  | { ok: false; reason: "denied" | "not_found" | "error" };

async function statDirectory(path: string): Promise<StatResult> {
  const p = nativePlugin() as unknown as {
    statDirectory?: (o: { path: string }) => Promise<{ mtime: number; count: number }>;
  } | null;
  if (!p?.statDirectory) return { ok: false, reason: "error" };
  try {
    const r = await p.statDirectory({ path });
    return { ok: true, mtime: r.mtime, count: r.count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/DENIED|permission/i.test(message)) return { ok: false, reason: "denied" };
    if (/NOT_FOUND|NOT_A_DIRECTORY/i.test(message)) return { ok: false, reason: "not_found" };
    return { ok: false, reason: "error" };
  }
}

export type CachedListing =
  | { ok: true; listing: NativeListing; fromCache: boolean }
  | { ok: false; reason: "denied" | "not_found" | "error"; message?: string };

/**
 * List a directory, reusing the cached entries when the native side
 * reports the folder is unchanged.
 */
export async function listDirectoryCached(
  path: string,
  opts: { force?: boolean } = {},
): Promise<CachedListing> {
  ensureHydrated();
  const active = inflight.get(path);
  if (active && !opts.force) return active;
  const request = listDirectoryCachedImpl(path, opts);
  inflight.set(path, request);
  try {
    return await request;
  } finally {
    if (inflight.get(path) === request) inflight.delete(path);
  }
}

async function listDirectoryCachedImpl(
  path: string,
  opts: { force?: boolean },
): Promise<CachedListing> {
  const cached = opts.force ? undefined : cache.get(path);
  if (opts.force) cache.delete(path);
  if (cached) {
    const s = await statDirectory(path);
    if (s.ok && s.mtime === cached.mtime && s.count === cached.count) {
      cached.at = Date.now();
      return {
        ok: true,
        listing: { path, entries: cached.entries },
        fromCache: true,
      };
    }
    if (!s.ok && s.reason === "not_found") {
      cache.delete(path);
      return { ok: true, listing: { path, entries: [] }, fromCache: false };
    }
    if (!s.ok && s.reason === "denied") {
      cache.delete(path);
      return { ok: false, reason: "denied" };
    }
  }

  const res = await listNativeDirectory(path);
  if (!res.ok) {
    cache.delete(path);
    return res;
  }
  // Store the directory's own mtime: this is the value returned by the
  // cheap validation probe. Using the newest child's mtime here made the
  // two values incomparable and forced a full listing on every opening.
  const stat = await statDirectory(path);
  let mtime = 0;
  for (const e of res.listing.entries) if (e.mtime > mtime) mtime = e.mtime;
  touch(path, {
    mtime: stat.ok ? stat.mtime : mtime,
    count: stat.ok ? stat.count : res.listing.entries.length,
    entries: res.listing.entries,
    at: Date.now(),
  });
  return { ok: true, listing: res.listing, fromCache: false };
}

/**
 * Lecture synchrone du cache — sert à peindre un dossier déjà visité
 * immédiatement (0 ms), pendant que `listDirectoryCached` revalide en
 * arrière-plan. Aucun écran de chargement lors des retours/renavigations.
 */
export function peekCachedEntries(path: string): NativeDirEntry[] | null {
  ensureHydrated();
  return cache.get(path)?.entries ?? null;
}

/**
 * Préchauffe le cache d'un dossier pendant les temps morts, pour que son
 * ouverture soit instantanée. Sans effet si déjà en cache.
 */
export function prefetchDirectory(path: string): void {
  ensureHydrated();
  if (cache.has(path)) return;
  const run = () => {
    if (cache.has(path)) return;
    void listNativeDirectory(path).then((res) => {
      if (!res.ok) return;
      let mtime = 0;
      for (const e of res.listing.entries) if (e.mtime > mtime) mtime = e.mtime;
      touch(path, {
        mtime,
        count: res.listing.entries.length,
        entries: res.listing.entries,
        at: Date.now(),
      });
    });
  };
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;
  if (ric) ric(run);
  else setTimeout(run, 120);
}

/** Drop a single directory from the cache (call after a mutation). */
export function invalidateDirectory(path: string): void {
  ensureHydrated();
  cache.delete(path);
  // Also drop the parent so parent listings pick up size/mtime changes.
  const idx = path.lastIndexOf("/");
  if (idx > 0) cache.delete(path.slice(0, idx));
  schedulePersist();
}

/** Drop every cached directory whose path starts with `rootPath`.
 *  Use after bulk mutations (a plan step that moved/copied under a
 *  destination root) to invalidate the entire subtree at once. */
export function invalidateUnder(rootPath: string): void {
  ensureHydrated();
  const prefix = rootPath.replace(/\/+$/, "");
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of Array.from(cache.keys())) {
    if (key === prefix || key.startsWith(prefix + "/")) cache.delete(key);
  }
}

/** Drop the entire cache (rare — permission changes, root switch). */
export function invalidateAll(): void {
  hydrated = true;
  cache.clear();
  schedulePersist();
}

/**
 * Mise à jour chirurgicale d'un dossier déjà en cache.
 *
 * Après une mutation, on préfère corriger les entrées connues plutôt que
 * jeter le cache : un dossier de 100 000 fichiers n'est jamais relu pour
 * un simple renommage. `mutate` renvoie `null` quand rien ne change.
 */
export function updateCachedEntries(
  absDir: string,
  mutate: (entries: NativeDirEntry[]) => NativeDirEntry[] | null,
): void {
  ensureHydrated();
  const cached = cache.get(absDir);
  if (!cached) return;
  const next = mutate(cached.entries);
  if (!next) return;
  let mtime = 0;
  for (const e of next) if (e.mtime > mtime) mtime = e.mtime;
  touch(absDir, { mtime, count: next.length, entries: next, at: Date.now() });
}

/** Le dossier est-il connu du cache ? */
export function hasCachedDirectory(absDir: string): boolean {
  ensureHydrated();
  return cache.has(absDir);
}
