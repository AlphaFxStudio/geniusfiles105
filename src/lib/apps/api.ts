/**
 * Front-end facade over the native GeniusFilesNative plugin for the
 * App Manager module. Everything here is safe to call from React
 * components: on the web preview it falls back to the deterministic
 * mock dataset, on Android it hits the plugin.
 *
 * We keep the surface intentionally small so future AI / backup /
 * update-comparison layers can wrap these calls instead of talking
 * to the plugin directly.
 */
import { isAndroidNative, nativePlugin } from "@/lib/native/geniusfiles-native";
import type { AppListResult, AppPermissions, AppStorageBreakdown, InstalledApp } from "./types";
import { t } from "@/lib/i18n";

type NativeApp = Omit<InstalledApp, "iconBase64"> & { iconBase64?: string };

type NativeListResponse = {
  apps: NativeApp[];
  count: number;
  statsSupported: boolean;
  usageAvailable: boolean;
};

type CachedApps = { version: 1; at: number; result: AppListResult };

const APPS_CACHE_KEY = "gf.apps.cache.v1";
const APPS_CACHE_TTL = 15 * 60_000;
let appsCache: CachedApps | null = null;
let appsHydrated = false;
let appsInflight: Promise<AppListResult> | null = null;

function hydrateAppsCache(): void {
  if (appsHydrated) return;
  appsHydrated = true;
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(APPS_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as CachedApps;
    if (parsed?.version === 1 && Array.isArray(parsed.result?.apps)) appsCache = parsed;
  } catch {
    /* Cache absent ou corrompu : la lecture native le reconstruira. */
  }
}

function persistAppsCache(value: CachedApps): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(APPS_CACHE_KEY, JSON.stringify(value));
  } catch {
    // Les icônes peuvent dépasser le quota de certains WebView : conserver
    // au minimum toutes les tailles et métadonnées, qui rendent la liste
    // immédiatement exploitable au prochain démarrage.
    try {
      const compact: CachedApps = {
        ...value,
        result: {
          ...value.result,
          apps: value.result.apps.map(({ iconBase64: _icon, ...app }) => app),
        },
      };
      window.localStorage.setItem(APPS_CACHE_KEY, JSON.stringify(compact));
    } catch {
      /* Le cache mémoire reste disponible pour toute la session. */
    }
  }
}

/** Dernière liste connue, disponible synchroniquement avant le premier rendu. */
export function peekInstalledApps(): AppListResult | null {
  hydrateAppsCache();
  return appsCache?.result ?? null;
}

type Plugin = {
  listInstalledApps?: (opts?: {
    includeIcons?: boolean;
    iconSize?: number;
  }) => Promise<NativeListResponse>;
  openApp?: (opts: { packageName: string }) => Promise<void>;
  openAppSettings?: (opts: { packageName: string }) => Promise<void>;
  uninstallApp?: (opts: { packageName: string }) => Promise<void>;
  getAppPermissions?: (opts: { packageName: string }) => Promise<AppPermissions>;
  getAppStorage?: (opts: { packageName: string }) => Promise<AppStorageBreakdown>;
  backupApk?: (opts: {
    packageName: string;
    destinationDir?: string;
  }) => Promise<{ path: string; size: number }>;
  shareAppInfo?: (opts: { text: string }) => Promise<void>;
  checkUsageAccess?: () => Promise<{ granted: boolean }>;
  requestUsageAccess?: () => Promise<void>;
};

function plugin(): Plugin | null {
  return nativePlugin() as unknown as Plugin | null;
}

export async function listInstalledApps(opts?: {
  includeIcons?: boolean;
  force?: boolean;
}): Promise<AppListResult> {
  hydrateAppsCache();
  const cached = appsCache;
  if (!opts?.force && cached && Date.now() - cached.at < APPS_CACHE_TTL) return cached.result;

  if (!isAndroidNative()) {
    // Aucune simulation : hors Android, la liste réelle est inaccessible.
    return {
      apps: [],
      statsSupported: false,
      usageAvailable: false,
      usable: false,
      reason: "not-native",
    };
  }

  const p = plugin();
  if (!p?.listInstalledApps) {
    return {
      apps: [],
      statsSupported: false,
      usageAvailable: false,
      usable: false,
      reason: "no-plugin",
    };
  }
  if (appsInflight) return appsInflight;
  appsInflight = (async () => {
    try {
      const res = await p.listInstalledApps?.({
        includeIcons: opts?.includeIcons ?? true,
        iconSize: 96,
      });
      if (!res) return cached?.result ?? unavailableApps("no-plugin");
      const result: AppListResult = {
        apps: res.apps,
        statsSupported: res.statsSupported,
        usageAvailable: res.usageAvailable,
        usable: true,
      };
      appsCache = { version: 1, at: Date.now(), result };
      persistAppsCache(appsCache);
      return result;
    } catch {
      return cached?.result ?? unavailableApps("error");
    } finally {
      appsInflight = null;
    }
  })();
  return appsInflight;
}

function unavailableApps(reason: "no-plugin" | "error"): AppListResult {
  return {
    apps: [],
    statsSupported: false,
    usageAvailable: false,
    usable: false,
    reason,
  };
}

export async function openApp(packageName: string): Promise<boolean> {
  const p = plugin();
  if (!p?.openApp) return false;
  try {
    await p.openApp({ packageName });
    return true;
  } catch {
    return false;
  }
}

export async function openAppSettings(packageName: string): Promise<boolean> {
  const p = plugin();
  if (!p?.openAppSettings) return false;
  try {
    await p.openAppSettings({ packageName });
    return true;
  } catch {
    return false;
  }
}

export async function uninstallApp(packageName: string): Promise<boolean> {
  const p = plugin();
  if (!p?.uninstallApp) return false;
  try {
    await p.uninstallApp({ packageName });
    return true;
  } catch {
    return false;
  }
}

export async function getAppPermissions(packageName: string): Promise<AppPermissions> {
  const p = plugin();
  if (!p?.getAppPermissions) return { granted: [], declared: [] };
  try {
    return await p.getAppPermissions({ packageName });
  } catch {
    return { granted: [], declared: [] };
  }
}

export async function getAppStorage(packageName: string): Promise<AppStorageBreakdown> {
  const p = plugin();
  if (!p?.getAppStorage) return { available: false };
  try {
    return await p.getAppStorage({ packageName });
  } catch {
    return { available: false };
  }
}

export async function backupApk(
  packageName: string,
  destinationDir?: string,
): Promise<{ ok: boolean; path?: string; size?: number; error?: string }> {
  const p = plugin();
  if (!p?.backupApk) return { ok: false, error: t("organize.apps.backupUnavailable") };
  try {
    const res = await p.backupApk({ packageName, destinationDir });
    return { ok: true, path: res.path, size: res.size };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function shareAppInfo(text: string): Promise<boolean> {
  const p = plugin();
  if (!p?.shareAppInfo) {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (d: { text: string }) => Promise<void> }).share({
          text,
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
  try {
    await p.shareAppInfo({ text });
    return true;
  } catch {
    return false;
  }
}

export async function checkUsageAccess(): Promise<boolean> {
  const p = plugin();
  if (!p?.checkUsageAccess) return !isAndroidNative(); // mock true on web
  try {
    const r = await p.checkUsageAccess();
    return r.granted;
  } catch {
    return false;
  }
}

export async function requestUsageAccess(): Promise<void> {
  const p = plugin();
  if (!p?.requestUsageAccess) return;
  try {
    await p.requestUsageAccess();
  } catch {
    /* opens Settings; ignore */
  }
}
