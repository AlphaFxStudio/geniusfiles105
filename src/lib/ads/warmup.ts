/**
 * Préchauffage publicitaire de GeniusFiles.
 *
 * Une seule annonce est préparée en arrière-plan, une seule fois par
 * session, après le premier écran (temps mort du fil principal). Objectif :
 * quand l'utilisateur atteint un emplacement publicitaire, l'annonce est
 * déjà en mémoire et s'affiche sans délai perceptible.
 *
 * Strictement non bloquant : hors APK, hors réseau ou en cas d'erreur,
 * l'application se comporte exactement comme si rien n'avait été tenté.
 */
import { adsAvailable, preloadBanner } from "@/lib/native/ads";
import { preloadRewarded } from "@/lib/native/rewarded";
import { refreshQuotas } from "@/lib/quota/store";

let warmed = false;

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/** Lance le préchauffage. Renvoie une fonction d'annulation. */
export function warmUpAds(): () => void {
  if (warmed || typeof window === "undefined") return () => {};
  warmed = true;

  const idle = window as IdleWindow;
  let timer: number | null = null;
  let idleId: number | null = null;

  const run = () => {
    /* Horloge de confiance et renouvellement éventuel, dès le démarrage. */
    void refreshQuotas();
    if (!adsAvailable()) return;
    void preloadBanner({ width: window.innerWidth });
    /* Annonce récompensée prête avant même que l'utilisateur la demande. */
    void preloadRewarded();
  };

  if (idle.requestIdleCallback) {
    idleId = idle.requestIdleCallback(run, { timeout: 2000 });
  } else {
    timer = window.setTimeout(run, 600);
  }

  return () => {
    if (timer != null) window.clearTimeout(timer);
    if (idleId != null) idle.cancelIdleCallback?.(idleId);
  };
}
