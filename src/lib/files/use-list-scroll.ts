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
 *   d'un dossier visité plus tôt dans la session ;
 * - à la PREMIÈRE arrivée sur un écran (on revient dans le gestionnaire
 *   après être passé par une autre section), rien n'est restauré : la
 *   liste démarre en haut, comme sur une application Android native.
 *
 * Point délicat corrigé ici : entre le changement de niveau et la
 * restauration, la liste est momentanément vide, le document rétrécit et
 * le navigateur émet un événement `scroll` à 0. Sans garde, cette valeur
 * écrasait la position mémorisée et le Retour ramenait en haut de liste.
 * L'enregistrement est donc suspendu tant que la position cible n'a pas
 * été rétablie, et la sauvegarde de la liste quittée se fait de façon
 * synchrone (effet de disposition), avant toute peinture.
 *
 * Le conteneur défilant est la fenêtre pour les écrans normaux, ou
 * l'ancêtre marqué `data-scroll-root` pour les couches superposées (mode
 * sélection).
 */
import { useEffect, useLayoutEffect, useRef } from "react";

import { forgetScrollFor, saveScrollFor, takeScrollFor } from "./scroll-memory";
import { isRevealPending } from "./reveal";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Durée pendant laquelle la position cible est réappliquée : les listes
 * virtualisées ne connaissent leur hauteur totale qu'après quelques
 * rendus (et parfois après la mesure des miniatures).
 */
const SETTLE_MS = 700;

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
  const mounted = useRef(false);
  /** Position à rétablir pour la clé courante (`null` = ne rien toucher). */
  const target = useRef<number | null>(null);
  /** Tant que la cible n'est pas atteinte, on n'enregistre rien. */
  const saving = useRef(true);
  const settled = useRef(true);

  /* Changement de niveau : sauvegarde synchrone de la liste quittée, puis
     capture immédiate de la position à rétablir. */
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const root = scrollRootFor();
    const first = !mounted.current;
    mounted.current = true;

    if (first) {
      /* Première arrivée sur l'écran : aucune restauration (on ne ramène
         jamais l'utilisateur à une position d'une visite précédente). */
      forgetScrollFor(key);
      target.current = null;
      saving.current = true;
      settled.current = true;
    } else {
      target.current = takeScrollFor(key);
      saving.current = false;
      settled.current = false;
    }

    const scroller: HTMLElement | Window = root ?? window;
    const onScroll = () => {
      if (saving.current) saveScrollFor(key, readScroll(root));
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (saving.current) saveScrollFor(key, readScroll(root));
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [key]);

  /* Restauration synchrone, avant peinture : rien ne clignote. */
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!ready || settled.current) return;

    /* Une mise en évidence est demandée (« Ouvrir l'emplacement ») : la
       position cible appartient à l'élément recherché, pas à la mémoire
       de la liste. On rend la main immédiatement. */
    if (isRevealPending()) {
      settled.current = true;
      saving.current = true;
      return;
    }

    const root = scrollRootFor();
    const y = target.current ?? 0;
    applyScroll(root, y);

    let frame = 0;
    const started = Date.now();
    const finish = () => {
      cancelAnimationFrame(frame);
      settled.current = true;
      saving.current = true;
      detach();
    };
    /* Un geste de l'utilisateur reprend immédiatement la main : on cesse
       de réappliquer la cible pour ne jamais contrarier le défilement. */
    const onUser = () => finish();
    const detach = () => {
      window.removeEventListener("touchstart", onUser);
      window.removeEventListener("wheel", onUser);
      window.removeEventListener("pointerdown", onUser);
    };
    window.addEventListener("touchstart", onUser, { passive: true });
    window.addEventListener("wheel", onUser, { passive: true });
    window.addEventListener("pointerdown", onUser, { passive: true });

    const settle = () => {
      const reached = Math.abs(readScroll(root) - y) <= 2;
      if (!reached) applyScroll(root, y);
      if (Date.now() - started >= SETTLE_MS) {
        finish();
        return;
      }
      frame = requestAnimationFrame(settle);
    };
    frame = requestAnimationFrame(settle);

    return () => {
      cancelAnimationFrame(frame);
      detach();
      /* L'écran change avant la fin du calage : l'enregistrement doit
         redevenir possible pour la liste suivante. */
      settled.current = true;
      saving.current = true;
    };
  }, [key, ready]);
}
