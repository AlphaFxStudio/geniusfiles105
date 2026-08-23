/**
 * Arbitrage des emplacements publicitaires.
 *
 * Une seule vue publicitaire native existe dans l'application. Chaque
 * emplacement monté « réclame » cette vue ; un seul pilote réellement la
 * bannière, les autres ne réservent aucune hauteur et n'envoient aucune
 * position. Impossible d'avoir deux bannières, ni une annonce posée sur le
 * contenu d'un autre bloc.
 *
 * Priorité : un emplacement dans le flux d'un écran (priorité 1) prend le
 * pas sur l'emplacement global de la coque (priorité 0). À égalité, le
 * dernier monté gagne.
 */

/** Priorité de l'emplacement global permanent (barre de la coque). */
export const CLAIM_GLOBAL = 0;
/** Priorité d'un emplacement propre à un écran. */
export const CLAIM_INLINE = 1;

type Claim = { token: object; priority: number };

const claims: Claim[] = [];
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribeClaims(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function claimBanner(token: object, priority: number = CLAIM_INLINE): void {
  claims.push({ token, priority });
  notify();
}

export function releaseBanner(token: object): void {
  const index = claims.findIndex((c) => c.token === token);
  if (index >= 0) claims.splice(index, 1);
  notify();
}

/** `true` si ce jeton est l'emplacement qui pilote la bannière native. */
export function isActiveClaim(token: object): boolean {
  let best: Claim | null = null;
  for (const claim of claims) {
    if (!best || claim.priority >= best.priority) best = claim;
  }
  return best?.token === token;
}
