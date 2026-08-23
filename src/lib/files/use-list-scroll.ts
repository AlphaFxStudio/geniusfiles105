/**
 * Conservation de la position de défilement des listes de GeniusFiles.
 *
 * Comportement unique pour le gestionnaire de fichiers, les stockages, les
 * catégories, la recherche et toutes les listes de l'application :
 *
 * - la position de la liste affichée est mémorisée en continu ;
 * - en ouvrant un élément (dossier, album, catégorie…), la position de la
 *   liste quittée est conservée ET la nouvelle liste démarre en haut ;
 * - au retour, la position est restituée AVANT le premier rendu peint —
 *   aucun saut visible, aucune animation, aucun rechargement ;
 * - la position est ensuite oubliée : on ne restaure jamais la position
 *   d'un dossier visité plus tôt dans la session.
 *
 * Le conteneur défilant est la fenêtre pour les écrans normaux, ou
 * l'ancêtre marqué `data-scroll-root` pour les couches superposées (mode
 * sélection). La restauration est réappliquée pendant quelques frames :
 * les listes virtualisées ne connaissent leur hauteur totale qu'après un
 * ou deux rendus.
 */
import { useEffect, useLayoutEffect, useRef } from "react";

import { saveScrollFor, takeScrollFor } from "./scroll-memory";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Nombre de frames pendant lesquelles la position cible est réappliquée. */
const SETTLE_FRAMES = 6;

function scrollRootFor(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>("[data-scroll-root]");
}

function readScroll(root: HTMLElement | null): number {
  return root ? root.scrollTop : window.scrollY;
}

function applyScroll(root: HTMLElement | null, y: number): void {
  if (root) root.scrollTop = y;
  else window.scrollTo({ top: y, behavior: "auto" });
}

/**
 * @param key   Identifiant de la liste affichée (dossier, catégorie…).
 * @param ready `true` dès que la liste a son contenu : la restauration
 *              n'a de sens qu'à ce moment-là.
 */
export function useListScrollMemory(key: string, ready: boolean): void {
  const restoredFor = useRef<string | null>(null);
  const mounted = useRef(false);

  // Mémorisation continue + sauvegarde au moment de quitter la liste.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = scrollRootFor();
    const target: HTMLElement | Window = root ?? window;
    const onScroll = () => saveScrollFor(key, readScroll(root));
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      saveScrollFor(key, readScroll(root));
      target.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  // Restauration synchrone, avant peinture : rien ne clignote.
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!ready || restoredFor.current === key) return;
    const first = !mounted.current;
    mounted.current = true;
    restoredFor.current = key;

    const root = scrollRootFor();
    const y = takeScrollFor(key);
    /* Premier affichage de l'écran sans position mémorisée : on ne touche
       à rien (le routeur ou l'ancrage d'un lien profond restent maîtres).
       Changement de niveau dans le même écran (ouvrir un dossier) : la
       nouvelle liste doit impérativement démarrer en haut. */
    if (first && y <= 0) return;

    applyScroll(root, y);
    /* Listes virtualisées : la hauteur totale peut n'être connue qu'après
       un ou deux rendus. On réapplique la cible pendant quelques frames,
       toujours sans animation, puis on s'arrête dès qu'elle est atteinte. */
    let frame = 0;
    let left = SETTLE_FRAMES;
    const settle = () => {
      if (left-- <= 0) return;
      if (Math.abs(readScroll(root) - y) > 2) applyScroll(root, y);
      frame = requestAnimationFrame(settle);
    };
    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [key, ready]);
}
