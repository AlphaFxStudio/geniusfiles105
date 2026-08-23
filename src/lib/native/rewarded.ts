/**
 * Pont JS ↔ annonce récompensée AdMob (GMA Next-Gen).
 *
 * L'annonce est **préchargée** en arrière-plan afin que l'utilisateur qui
 * choisit de la regarder ne patiente jamais. Hors runtime Android natif
 * (web, SSR, aperçu), tout est strictement no-op : la fonction renvoie
 * « indisponible » et l'interface propose simplement d'attendre le
 * renouvellement quotidien.
 *
 * Aucune donnée personnelle n'est transmise au SDK : seul un jeton
 * aléatoire à usage unique accompagne la demande d'affichage.
 */
import { isNativeRuntime, nativePlatform } from "./platform";

/** Bloc de TEST officiel Google (annonce récompensée Android). */
export const TEST_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

type RewardedBridge = {
  isAvailable(): Promise<{ available: boolean }>;
  preload(options: { unitId?: string }): Promise<{ ready: boolean }>;
  getStatus(options?: { unitId?: string }): Promise<{ ready: boolean }>;
  show(options: {
    unitId?: string;
    nonce: string;
  }): Promise<{ rewarded: boolean; nonce?: string; error?: string }>;
};

let bridge: RewardedBridge | null = null;

function plugin(): RewardedBridge | null {
  if (bridge) return bridge;
  if (!isNativeRuntime() || nativePlatform() !== "android") return null;
  const plugins = (window as unknown as { Capacitor?: { Plugins?: Record<string, unknown> } })
    .Capacitor?.Plugins;
  bridge = (plugins?.["GeniusFilesRewarded"] as RewardedBridge | undefined) ?? null;
  return bridge;
}

/** `true` uniquement dans l'APK, quand le plugin natif est enregistré. */
export function rewardedAvailable(): boolean {
  return plugin() !== null;
}

/** Prépare une annonce à l'avance (best-effort, jamais bloquant). */
export async function preloadRewarded(): Promise<void> {
  const api = plugin();
  if (!api) return;
  try {
    await api.preload({ unitId: TEST_REWARDED_UNIT_ID });
  } catch {
    /* préchargement facultatif */
  }
}

/** `true` si une annonce récompensée est prête à être affichée. */
export async function rewardedReady(): Promise<boolean> {
  const api = plugin();
  if (!api) return false;
  try {
    const res = await api.getStatus({ unitId: TEST_REWARDED_UNIT_ID });
    return Boolean(res?.ready);
  } catch {
    return false;
  }
}

/** Jeton à usage unique associé à un visionnage. */
export function createRewardNonce(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export type RewardedResult = { rewarded: boolean; nonce: string; error?: string };

/**
 * Affiche l'annonce et attend sa fermeture.
 * `rewarded` n'est vrai que si le SDK a validé la récompense **et** que le
 * jeton renvoyé correspond exactement à celui envoyé.
 */
export async function showRewarded(nonce: string): Promise<RewardedResult> {
  const api = plugin();
  if (!api) return { rewarded: false, nonce, error: "unavailable" };
  try {
    const res = await api.show({ unitId: TEST_REWARDED_UNIT_ID, nonce });
    const ok = Boolean(res?.rewarded) && res?.nonce === nonce;
    return { rewarded: ok, nonce, ...(res?.error ? { error: res.error } : {}) };
  } catch (err) {
    return { rewarded: false, nonce, error: err instanceof Error ? err.message : "error" };
  }
}
