/**
 * Emplacement publicitaire des écrans *réellement* vides.
 *
 * Le pavé Medium Rectangle n'est posé que si l'écran vide laisse assez de
 * place sous son message : jamais au-dessus de l'illustration, du texte ou
 * de l'action, jamais sur un petit écran, et jamais quand l'écran vide
 * propose déjà une action importante. Sans annonce chargée, le bloc et son
 * séparateur disparaissent : aucun espace vide n'est laissé.
 */
import { useEffect, useRef, useState } from "react";

import { InlineAdBanner } from "@/components/ads/InlineAdBanner";
import { useAdSlot } from "@/lib/ads/useAdSlot";
import { MREC_HEIGHT } from "@/lib/ads/policy";

/** Marge de confort au-dessus et sous le pavé (label « Ad » compris). */
const MREC_CHROME = 64;
/** En dessous, l'écran est trop court : le message doit garder sa place. */
const MIN_VIEWPORT_HEIGHT = 620;
const MIN_VIEWPORT_WIDTH = 320;

export function EmptyStateAd({ slot }: { slot: string }) {
  const allowed = useAdSlot(slot);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [hasRoom, setHasRoom] = useState(false);

  useEffect(() => {
    if (!allowed) return;
    const anchor = anchorRef.current;
    if (!anchor) return;

    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      const viewportOk =
        window.innerHeight >= MIN_VIEWPORT_HEIGHT && window.innerWidth >= MIN_VIEWPORT_WIDTH;
      /* Place restante sous le contenu de l'écran vide, en s'arrêtant
         au-dessus de la navigation inférieure et de toute couche basse
         (mini-lecteur, barre de sélection…) : le pavé n'est proposé que
         s'il tient entièrement dans cet espace libre. */
      let bottom = window.innerHeight;
      const nav = document.querySelector("[data-gf-bottom-nav]");
      if (nav) bottom = Math.min(bottom, nav.getBoundingClientRect().top);
      for (const el of document.querySelectorAll("[data-gf-ad-blocker]")) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top >= rect.top - 1) bottom = Math.min(bottom, r.top);
      }
      const available = bottom - rect.top;
      setHasRoom(viewportOk && available >= MREC_HEIGHT + MREC_CHROME);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(anchor);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    /* La navigation, les barres de sélection et le mini-lecteur peuvent
       apparaître après coup : une vérification périodique légère suffit. */
    const poll = window.setInterval(measure, 500);
    return () => {
      ro.disconnect();
      window.clearInterval(poll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [allowed]);

  if (!allowed) return null;

  return (
    <div ref={anchorRef} className="w-full">
      {hasRoom ? (
        <div className="mx-auto mt-8 w-full max-w-[360px] border-t border-border/60 pt-4">
          <InlineAdBanner slot={slot} format="mrec" />
        </div>
      ) : null}
    </div>
  );
}
