/**
 * Pont JS ↔ bannière AdMob native (GMA Next-Gen).
 *
 * La WebView ne peut pas afficher de vue native dans son flux : la bannière
 * est une `AdView` superposée, positionnée aux coordonnées CSS du bloc
 * réservé par le composant `<AdBanner />`. Hors runtime Android natif (web,
 * SSR, aperçu Lovable), tout est strictement no-op.
 *
 * Aucune donnée personnelle n'est transmise au SDK par ce module.
 */
import { isNativeRuntime, nativePlatform } from "./platform";

type AdsBridge = {
  isAvailable(): Promise<{ available: boolean }>;
  showBanner(options: {
    x: number;
    y: number;
    width: number;
    unitId?: string;
    format?: AdFormat;
  }): Promise<{ height: number; shown: boolean; loaded?: boolean }>;
  hideBanner(): Promise<void>;
  removeBanner(): Promise<void>;
  preload(options: { width: number; unitId?: string; format?: AdFormat }): Promise<{
    loaded: boolean;
  }>;
  getStatus(): Promise<{ loaded: boolean; height: number }>;
};

/** Dernier état connu de la bannière : évite tout délai / saut au montage. */
export type BannerStatus = { loaded: boolean; height: number };

let lastStatus: BannerStatus = { loaded: false, height: 0 };
const statusListeners = new Set<(status: BannerStatus) => void>();
let statusBound = false;
let preloaded = "";

/** Format demandé : bannière adaptative ancrée, ou Medium Rectangle 300x250. */
export type AdFormat = "adaptive" | "mrec";

/** Bloc de TEST officiel Google : à remplacer avant publication. */
export const TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/9214589741";

let bridge: AdsBridge | null = null;

function plugin(): AdsBridge | null {
  if (bridge) return bridge;
  if (!isNativeRuntime() || nativePlatform() !== "android") return null;
  const plugins = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } })
    .Capacitor?.Plugins;
  bridge = (plugins?.["GeniusFilesAds"] as AdsBridge | undefined) ?? null;
  return bridge;
}

/** `true` uniquement dans l'APK, quand le plugin natif est enregistré. */
export function adsAvailable(): boolean {
  return plugin() !== null;
}

/**
 * Précharge une annonce dès que possible (démarrage de l'application).
 * Best-effort et non bloquant : sans pont natif ou sans réseau, no-op.
 */
export async function preloadBanner(
  options: { width: number; unitId?: string; format?: AdFormat } = { width: 360 },
): Promise<void> {
  const api = plugin();
  if (!api?.preload) return;
  /* Une seule requête par configuration : naviguer entre des écrans qui
     partagent le même emplacement ne relance aucun chargement. */
  const key = `${options.unitId ?? TEST_BANNER_UNIT_ID}|${options.format ?? "adaptive"}|${Math.round(options.width || 360)}`;
  if (preloaded === key) return;
  preloaded = key;
  try {
    await api.preload({
      width: Math.round(options.width || 360),
      unitId: options.unitId ?? TEST_BANNER_UNIT_ID,
      format: options.format ?? "adaptive",
    });
  } catch {
    /* préchargement facultatif */
  }
}

/** État connu sans aller-retour : hauteur immédiatement réservable. */
export function bannerStatus(): BannerStatus {
  return lastStatus;
}

/** Affiche / repositionne la bannière. Renvoie la hauteur à réserver (px CSS). */
export async function showBannerAt(rect: {
  x: number;
  y: number;
  width: number;
  unitId?: string;
  format?: AdFormat;
}): Promise<number> {
  const api = plugin();
  if (!api) return 0;
  try {
    const res = await api.showBanner({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      unitId: rect.unitId ?? TEST_BANNER_UNIT_ID,
      format: rect.format ?? "adaptive",
    });
    if (typeof res?.height === "number" && (res as { loaded?: boolean }).loaded) {
      /* La hauteur réelle est diffusée aux emplacements montés : la bande
         réserve son espace dès le premier affichage, sans attendre un
         événement natif. */
      if (!lastStatus.loaded || lastStatus.height !== res.height) {
        emitStatus({ loaded: true, height: res.height });
      }
    }
    return typeof res?.height === "number" ? res.height : 0;
  } catch {
    return 0;
  }
}

/** Masque la bannière sans détruire l'annonce chargée. */
export async function hideBanner(): Promise<void> {
  const api = plugin();
  if (!api) return;
  try {
    await api.hideBanner();
  } catch {
    /* pont indisponible */
  }
}

/** Retire la bannière et libère ses ressources natives. */
export async function removeBanner(): Promise<void> {
  const api = plugin();
  if (!api) return;
  try {
    await api.removeBanner();
  } catch {
    /* pont indisponible */
  }
}

/**
 * Écoute le résultat de chargement de la bannière (chargée / échouée).
 *
 * Un seul écouteur natif est posé pour toute l'application : les
 * emplacements s'y branchent sans coût, et reçoivent immédiatement le
 * dernier état connu (annonce déjà préchargée = affichage instantané).
 * Hors runtime natif, l'abonnement est un no-op.
 */
export function onBannerStatus(handler: (status: BannerStatus) => void): () => void {
  if (!plugin()) return () => {};
  statusListeners.add(handler);
  bindStatus();
  if (lastStatus.loaded) handler(lastStatus);
  else void refreshStatus();
  return () => {
    statusListeners.delete(handler);
  };
}

function emitStatus(status: BannerStatus): void {
  lastStatus = status;
  for (const listener of statusListeners) listener(status);
}

/** Interroge une fois l'état natif (annonce préchargée avant le montage). */
async function refreshStatus(): Promise<void> {
  const api = plugin();
  if (!api?.getStatus) return;
  try {
    const res = await api.getStatus();
    const status = { loaded: Boolean(res?.loaded), height: Number(res?.height ?? 0) };
    if (status.loaded !== lastStatus.loaded || status.height !== lastStatus.height) {
      emitStatus(status);
    }
  } catch {
    /* pont indisponible */
  }
}

function bindStatus(): void {
  if (statusBound) return;
  const capacitor = (
    window as unknown as {
      Capacitor?: {
        Plugins?: Record<
          string,
          { addListener?: (e: string, cb: (data: unknown) => void) => unknown } | undefined
        >;
      };
    }
  ).Capacitor;
  const api = capacitor?.Plugins?.["GeniusFilesAds"];
  if (!api?.addListener) return;
  try {
    api.addListener("bannerStatus", (data) => {
      const status = data as { loaded?: boolean; height?: number };
      emitStatus({ loaded: Boolean(status?.loaded), height: Number(status?.height ?? 0) });
    });
    statusBound = true;
  } catch {
    /* pont fermé */
  }
}
