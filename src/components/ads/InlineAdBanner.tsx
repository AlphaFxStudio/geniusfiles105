/**
 * Emplacement publicitaire *dans le flux* de la page.
 *
 * La bannière native occupe sa propre bande de contenu : le bloc réserve
 * réellement sa hauteur dans la mise en page (rien n'est recouvert), et la
 * vue native est repositionnée sur ses coordonnées à chaque défilement.
 * Hors écran, elle est masquée ; sans annonce chargée, le bloc se réduit à
 * zéro et l'interface retrouve tout son espace.
 */
import { useEffect, useRef, useState } from "react";

import { useT } from "@/lib/i18n";
import { useAdSlot } from "@/lib/ads/useAdSlot";
import { MREC_HEIGHT, MREC_WIDTH, TEST_BANNER_UNIT_ID, TEST_MREC_UNIT_ID } from "@/lib/ads/policy";
import type { AdFormat } from "@/lib/native/ads";
import { bannerStatus, hideBanner, onBannerStatus, showBannerAt } from "@/lib/native/ads";
import { adsObstructed } from "@/lib/ads/obstruction";
import {
  CLAIM_INLINE,
  claimBanner,
  isActiveClaim,
  releaseBanner,
  subscribeClaims,
} from "@/lib/ads/claims";

type Props = {
  /** Identifiant logique de l'emplacement (politique par écran). */
  slot?: string;
  /** Bloc d'annonces ; par défaut le bloc de TEST officiel Google. */
  unitId?: string;
  /** « mrec » : pavé 300x250 centré, réservé aux écrans vides spacieux. */
  format?: AdFormat;
};

export function InlineAdBanner({ slot = "inline", unitId, format = "adaptive" }: Props) {
  const mrec = format === "mrec";
  const resolvedUnitId = unitId ?? (mrec ? TEST_MREC_UNIT_ID : TEST_BANNER_UNIT_ID);
  const t = useT();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<object>({});
  const allowed = useAdSlot(slot);
  /* `true` seulement pour l'emplacement qui pilote la bannière native. */
  const [active, setActive] = useState(false);
  /* Hauteur réellement occupée : 0 tant qu'aucune annonce n'est chargée.
     Une annonce déjà préchargée donne sa hauteur dès le premier rendu :
     l'affichage est immédiat et ne provoque aucun saut. */
  const [height, setHeight] = useState(() => (mrec ? 0 : bannerStatus().height));
  /* Hauteur lue par la boucle de positionnement sans relancer l'effet. */
  const heightRef = useRef(0);
  heightRef.current = height;

  useEffect(() => {
    if (!allowed) return;
    const token = tokenRef.current;
    const update = () => setActive(isActiveClaim(token));
    const unsubscribe = subscribeClaims(update);
    claimBanner(token, CLAIM_INLINE);
    return () => {
      unsubscribe();
      releaseBanner(token);
      setActive(false);
    };
  }, [allowed]);

  const live = allowed && active;

  useEffect(() => {
    if (!live) {
      setHeight(0);
      return;
    }
    return onBannerStatus(({ loaded, height: h }) => setHeight(loaded && h > 0 ? h : 0));
  }, [live]);

  useEffect(() => {
    if (!live) return;
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let last = "";
    let hidden = false;

    /* Conteneur défilant qui contient le bloc : la vue native ne doit
       jamais déborder de sa zone visible (page de conversation, panneau
       d'éditeur…). */
    const clip = (() => {
      let node: HTMLElement | null = host.parentElement;
      while (node) {
        const style = window.getComputedStyle(node);
        if (/(auto|scroll|hidden)/.test(`${style.overflowY}${style.overflow}`)) return node;
        node = node.parentElement;
      }
      return null;
    })();

    const apply = () => {
      frame = 0;
      if (disposed) return;
      const rect = host.getBoundingClientRect();
      /* Zone réellement disponible : sous la barre d'état et *au-dessus*
         de la navigation principale, qui est une couche fixe. La vue
         native n'est posée que si elle y tient entièrement — elle ne peut
         donc jamais recouvrir la navigation ni un bouton. */
      const nav = document.querySelector("[data-gf-bottom-nav]");
      let limit = nav ? nav.getBoundingClientRect().top : window.innerHeight;
      let ceiling = 0;
      /* Couches basses de l'application (mini-lecteur audio, barre de
         saisie et bandeau de suggestions de Genius AI, barres d'outils
         d'éditeur…) : la vue native s'arrête au-dessus d'elles. */
      for (const el of document.querySelectorAll("[data-gf-ad-blocker]")) {
        const r = el.getBoundingClientRect();
        if (r.height <= 0) continue;
        /* Toute couche fixe qui commence sous le haut du bloc — même si le
           bloc n'est encore qu'un repère d'1 px — borne la vue native. */
        if (r.bottom > rect.top) limit = Math.min(limit, r.top);
      }
      if (clip) {
        const cr = clip.getBoundingClientRect();
        limit = Math.min(limit, cr.bottom);
        ceiling = Math.max(ceiling, cr.top);
      }
      /* Hauteur que la vue native occupera réellement : tant que le bloc
         n'est qu'un repère d'1 px, se fier à sa hauteur laisserait poser
         l'annonce trop bas (bref chevauchement de la navigation, puis
         masquage : un clignotement). */
      const needed = Math.max(
        rect.height,
        heightRef.current || (mrec ? MREC_HEIGHT : bannerStatus().height) || 0,
      );
      const target = new DOMRect(rect.left, rect.top, rect.width, needed);
      const visible =
        rect.width >= 40 &&
        rect.top >= ceiling &&
        rect.top + needed <= limit &&
        !adsObstructed(target, host);
      if (!visible) {
        if (!hidden) {
          hidden = true;
          /* La position devra être renvoyée au retour à l'écran, même si
             elle est identique : sinon la vue resterait masquée. */
          last = "";
          void hideBanner();
        }
        return;
      }
      hidden = false;
      const key = `${Math.round(rect.left)}:${Math.round(rect.top)}:${Math.round(rect.width)}`;
      if (key === last) return;
      last = key;
      void showBannerAt({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        unitId: resolvedUnitId,
        format,
      });
    };

    /* Une seule mise à jour par image : le défilement reste fluide. */
    const sync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(host);
    window.addEventListener("scroll", sync, { passive: true, capture: true });
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    /* Filet de sécurité léger : la navigation, les feuilles et les barres
       de sélection apparaissent parfois après coup. Une vérification par
       demi-seconde suffit à replacer — ou masquer — la vue native. */
    const poll = window.setInterval(sync, 500);
    sync();

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.clearInterval(poll);
      ro.disconnect();
      window.removeEventListener("scroll", sync, true);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      setHeight(0);
      /* Changement d'écran : la vue native est masquée sur-le-champ (jamais
         visible sur la page suivante) mais l'annonce chargée est conservée
         pour un retour instantané, sans nouvelle requête réseau. */
      void hideBanner();
    };
  }, [live, resolvedUnitId, format, mrec]);

  if (!live) return null;

  return (
    <section
      aria-label={t("ads.label")}
      /* Sans annonce chargée : hauteur nulle, aucun espace perdu. */
      className={`${mrec ? "text-center" : ""} overflow-hidden transition-[height,opacity] duration-200 ease-out ${
        height > 0 ? "opacity-100" : "pointer-events-none h-0 opacity-0"
      }`}
    >
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        {t("ads.label")}
      </p>
      <div
        ref={hostRef}
        aria-hidden="true"
        className={`rounded-2xl bg-muted/30 ${mrec ? "mx-auto" : "w-full"}`}
        style={{ height: height || 1, width: mrec ? MREC_WIDTH : undefined }}
      />
    </section>
  );
}
