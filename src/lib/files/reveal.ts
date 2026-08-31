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
 */

const FLASH_CLASS = "gf-reveal-flash";
const FLASH_MS = 1800;

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
  const selector = `[data-entry-name="${CSS.escape(name)}"]`;
  let attempts = 0;

  const step = () => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "auto" });
      // Un dernier tour de boucle laisse la virtualisation se stabiliser
      // avant l'effet lumineux.
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(selector) ?? el;
        flash(target);
      });
      return;
    }
    if (attempts++ > 24 || index == null) return;

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
