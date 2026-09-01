/**
 * Mise en évidence d'un élément dans une liste de fichiers.
 *
 * La liste peut être virtualisée : l'élément visé n'est alors pas encore
 * dans le DOM. On s'en approche donc par sauts successifs (en comparant
 * l'index visé aux index réellement rendus) jusqu'à ce qu'il apparaisse,
 * puis on le centre et on le fait clignoter brièvement.
 *
 * Aucune page n'est rechargée, aucun état n'est perdu : seul le
 * défilement bouge.
 *
 * Point délicat : la mémoire de position des listes réapplique la
 * position mémorisée pendant quelques centaines de millisecondes après
 * l'affichage d'un dossier. Sans coordination, elle ramenait la liste en
 * arrière juste après le défilement vers l'élément recherché — celui-ci
 * clignotait donc hors écran. Un drapeau partagé (« une mise en évidence
 * est en cours ») suspend cette restauration.
 */

const FLASH_CLASS = "gf-reveal-flash";
const FLASH_MS = 1800;
const PENDING_KEY = "gf.files.revealPending";
const PENDING_TTL_MS = 15000;

/** Signale qu'une mise en évidence est demandée (avant même la navigation). */
export function markRevealPending(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, String(Date.now()));
  } catch {
    /* stockage indisponible */
  }
}

export function clearRevealPending(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* stockage indisponible */
  }
}

/** Vrai tant qu'une mise en évidence est en attente ou en cours. */
export function isRevealPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts) || Date.now() - ts > PENDING_TTL_MS) {
      clearRevealPending();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function flash(el: HTMLElement) {
  el.classList.remove(FLASH_CLASS);
  // Reflow pour pouvoir rejouer l'animation sur un même élément.
  void el.offsetWidth;
  el.classList.add(FLASH_CLASS);
  window.setTimeout(() => el.classList.remove(FLASH_CLASS), FLASH_MS);
}

function scrollRootOf(el: Element | null): HTMLElement | null {
  let node: HTMLElement | null = (el as HTMLElement | null)?.parentElement ?? null;
  while (node) {
    if (node.hasAttribute("data-scroll-root")) return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Fait défiler jusqu'à l'élément nommé puis le met en évidence.
 *
 * @param name  nom de l'entrée (attribut `data-entry-name`)
 * @param index position de l'entrée dans la liste affichée (facultatif,
 *              utilisé pour converger quand la liste est virtualisée)
 */
export function revealEntry(name: string, index?: number): void {
  if (typeof window === "undefined") return;
  markRevealPending();
  const selector = `[data-entry-name="${CSS.escape(name)}"]`;
  let attempts = 0;

  /* Une fois l'élément trouvé, la virtualisation peut encore le déplacer
     de quelques pixels : on le recentre sur plusieurs frames avant de
     déclencher l'effet lumineux, puis on rend la main à la mémoire de
     position. */
  const settleOn = (el: HTMLElement) => {
    let passes = 0;
    const center = () => {
      const target = document.querySelector<HTMLElement>(selector) ?? el;
      target.scrollIntoView({ block: "center", behavior: "auto" });
      if (passes++ < 4) {
        requestAnimationFrame(center);
        return;
      }
      flash(target);
      clearRevealPending();
    };
    center();
  };

  const step = () => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      settleOn(el);
      return;
    }
    if (attempts++ > 90 || index == null) {
      clearRevealPending();
      return;
    }

    // Élément non rendu : on se rapproche en comparant aux index visibles.
    const rendered = Array.from(document.querySelectorAll<HTMLElement>("[data-index]"));
    const indexes = rendered
      .map((n) => Number(n.dataset["index"]))
      .filter((n) => Number.isFinite(n));
    const min = indexes.length ? Math.min(...indexes) : 0;
    const max = indexes.length ? Math.max(...indexes) : 0;
    const forward = index > max || indexes.length === 0;
    const root = scrollRootOf(rendered[0] ?? null);
    const viewport = root ? root.clientHeight : window.innerHeight;
    const delta = (forward ? 1 : -1) * viewport * 0.8;
    if (index < min || index > max) {
      if (root) root.scrollBy({ top: delta, behavior: "auto" });
      else window.scrollBy({ top: delta, behavior: "auto" });
    }
    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}
