/**
 * Accès React aux quotas quotidiens.
 *
 * L'état vit hors de React (module `./store`) : quitter puis revenir sur un
 * écran n'altère jamais les compteurs, et deux écrans affichent toujours la
 * même valeur.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  grantRewardedUse,
  quotaSnapshot,
  refreshQuotas,
  subscribeQuota,
  type QuotaFeature,
  type QuotaSnapshot,
} from "./store";
import { nextRenewalMs, trustedNow } from "./time";
import {
  createRewardNonce,
  preloadRewarded,
  rewardedAvailable,
  showRewarded,
} from "../native/rewarded";

/** Instantané réactif du quota d'une fonctionnalité. */
export function useQuota(feature: QuotaFeature): QuotaSnapshot {
  const snapshot = useSyncExternalStore(
    subscribeQuota,
    () => quotaSnapshot(feature),
    () => quotaSnapshot(feature),
  );

  useEffect(() => {
    void refreshQuotas();
    /* Le renouvellement peut tomber pendant que l'écran est ouvert. */
    const timer = setInterval(() => void refreshQuotas(), 60_000);
    return () => clearInterval(timer);
  }, []);

  return snapshot;
}

/** Temps restant avant le renouvellement, en millisecondes. */
export function useRenewalCountdown(): number {
  const [ms, setMs] = useState(() => Math.max(0, nextRenewalMs(trustedNow()) - trustedNow()));
  useEffect(() => {
    const tick = () => setMs(Math.max(0, nextRenewalMs(trustedNow()) - trustedNow()));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);
  return ms;
}

export type RewardOutcome = "granted" | "declined" | "unavailable";

/**
 * Regarder une annonce récompensée pour obtenir une utilisation.
 * L'utilisation n'est créditée que si le SDK confirme la récompense.
 */
export function useRewardedUse(feature: QuotaFeature): {
  watching: boolean;
  available: boolean;
  watch: () => Promise<RewardOutcome>;
} {
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    void preloadRewarded();
  }, []);

  const watch = useCallback(async (): Promise<RewardOutcome> => {
    if (!rewardedAvailable()) return "unavailable";
    setWatching(true);
    try {
      const nonce = createRewardNonce();
      const res = await showRewarded(nonce);
      if (!res.rewarded) return res.error === "unavailable" ? "unavailable" : "declined";
      const granted = grantRewardedUse(feature, res.nonce);
      /* Annonce suivante préparée immédiatement. */
      void preloadRewarded();
      return granted ? "granted" : "declined";
    } finally {
      setWatching(false);
    }
  }, [feature]);

  return { watching, available: rewardedAvailable(), watch };
}
