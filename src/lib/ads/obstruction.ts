/**
 * Détection des couches qui interdisent d'afficher la vue publicitaire
 * native à un endroit donné.
 *
 * La vue native d'AdMob est dessinée *au-dessus* de la page web : une
 * boîte de dialogue, une feuille, le lecteur audio plein écran, la
 * visionneuse d'image ou la lecture vidéo passeraient donc sous elle. Tant
 * qu'une de ces couches recouvre l'emplacement, la vue native est masquée
 * — sans libérer la hauteur réservée, pour éviter tout saut de contenu.
 */

const OVERLAY_SELECTOR = '[role="dialog"],[role="alertdialog"],[data-gf-ad-overlay]';

/**
 * Plan d'empilement d'un élément : plus grand `z-index` rencontré sur ses
 * ancêtres positionnés. Sert à savoir si une couche modale passe réellement
 * *au-dessus* de l'emplacement publicitaire ou derrière lui.
 */
function layerZ(el: Element | null): number {
  let node: Element | null = el;
  let z = 0;
  while (node instanceof HTMLElement) {
    const value = Number.parseInt(window.getComputedStyle(node).zIndex, 10);
    if (Number.isFinite(value)) z = Math.max(z, value);
    node = node.parentElement;
  }
  return z;
}

/**
 * `true` si une couche modale recouvre le rectangle donné.
 *
 * `host` (le bloc qui réserve la place de l'annonce) permet d'ignorer les
 * couches qui *contiennent* l'emplacement ou qui sont empilées derrière
 * lui : un éditeur ouvert au-dessus d'une visionneuse garde ainsi son
 * emplacement publicitaire.
 */
export function adsObstructed(rect: DOMRect, host?: Element | null): boolean {
  if (typeof document === "undefined") return false;
  /* Lecture d'un document en plein écran. */
  if (document.documentElement.dataset["gfReader"]) return true;
  const hostZ = host ? layerZ(host) : Number.POSITIVE_INFINITY;
  for (const el of document.querySelectorAll(OVERLAY_SELECTOR)) {
    if (host && (el.contains(host) || layerZ(el) < hostZ)) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (r.left < rect.right && r.right > rect.left && r.top < rect.bottom && r.bottom > rect.top) {
      return true;
    }
  }
  return false;
}
