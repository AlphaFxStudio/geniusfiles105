/**
 * Politique publicitaire de GeniusFiles.
 *
 * Ce module ne rend rien : il décide seulement *si* un emplacement
 * publicitaire a le droit de s'afficher. Il permet d'activer ou de
 * désactiver les annonces par écran et de les suspendre temporairement
 * pendant une opération importante (copie, chiffrement, export…).
 *
 * Aucune donnée personnelle n'est utilisée ni transmise ici.
 */

/** Identifiants d'emplacements prévus (aucun n'est encore posé dans l'UI). */
export type AdSlotId = string;

/** Bloc de TEST officiel Google, utilisé pendant tout le développement. */
export const TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/9214589741";

/** Bloc de TEST officiel Google pour le format Medium Rectangle (300x250). */
export const TEST_MREC_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";

/** Dimensions CSS du Medium Rectangle et place minimale pour l'accueillir. */
export const MREC_WIDTH = 300;
export const MREC_HEIGHT = 250;

/**
 * Écrans sans aucune publicité : coffre-fort (contenu sensible) et
 * lecteurs/éditeurs plein écran où une bannière gênerait l'interaction.
 */
const AD_FREE_ROUTES = ["/coffre-fort", "/editeur-audio", "/assistant"];

/**
 * Exceptions ciblées : emplacements explicitement autorisés sur un écran
 * par ailleurs sans publicité (ex. l'accueil de Genius AI, avant toute
 * conversation). L'écran reste sans publicité partout ailleurs.
 */
const AD_FREE_ROUTE_EXCEPTIONS: Record<string, readonly string[]> = {
  "/assistant": ["assistant-welcome"],
  /* Éditeur audio : une seule bande, tout en bas, sous la barre d'outils. */
  "/editeur-audio": ["audio-editor"],
};

/** Raisons de suspension actives (opérations importantes en cours). */
const suspensions = new Set<string>();
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** S'abonner aux changements de politique (suspension / reprise). */
export function subscribeAdsPolicy(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Suspend toutes les annonces tant que `resumeAds(reason)` n'est pas appelé. */
export function suspendAds(reason: string): void {
  if (suspensions.has(reason)) return;
  suspensions.add(reason);
  emit();
}

/** Lève une suspension posée par `suspendAds`. */
export function resumeAds(reason: string): void {
  if (!suspensions.delete(reason)) return;
  emit();
}

/** `true` si une opération importante bloque actuellement les annonces. */
export function adsSuspended(): boolean {
  return suspensions.size > 0;
}

/** `true` si le chemin courant est un écran déclaré sans publicité. */
export function isAdFreeRoute(pathname: string): boolean {
  return AD_FREE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Décision finale pour un emplacement donné sur un chemin donné. */
export function adSlotAllowed(_slot: AdSlotId, pathname: string): boolean {
  if (adsSuspended()) return false;
  if (!isAdFreeRoute(pathname)) return true;
  return Object.entries(AD_FREE_ROUTE_EXCEPTIONS).some(
    ([route, slots]) =>
      (pathname === route || pathname.startsWith(`${route}/`)) && slots.includes(_slot),
  );
}
