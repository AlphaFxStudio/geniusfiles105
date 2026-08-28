import { useEffect, useRef } from "react";

/**
 * Disque vinyle premium.
 *
 * Rotation pilotée par requestAnimationFrame avec une vitesse angulaire
 * lissée : la lecture accélère le disque en douceur, la pause le
 * décélère jusqu'à l'arrêt au lieu de figer brutalement une animation CSS.
 *
 * L'étiquette centrale n'affiche JAMAIS le titre : elle porte la pochette
 * du morceau quand elle existe, sinon un simple symbole. Le titre vit dans
 * la zone d'informations, une seule fois.
 */
export function VinylDisc({
  playing,
  artworkUrl,
  className = "",
}: {
  playing: boolean;
  artworkUrl?: string | null;
  className?: string;
}) {
  const discRef = useRef<HTMLDivElement | null>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const el = discRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;

    let angle = 0;
    let speed = 0; // deg / second
    let last = performance.now();
    let raf = 0;

    const TARGET = 20; // ~3 tours / minute, lent et régulier

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = playingRef.current ? TARGET : 0;
      // Ease vers la vitesse cible : montée douce, arrêt progressif.
      const k = playingRef.current ? 1.6 : 0.9;
      speed += (target - speed) * Math.min(1, k * dt);
      if (!playingRef.current && speed < 0.05) speed = 0;
      angle = (angle + speed * dt) % 360;
      el.style.transform = `rotate(${angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Halo très léger derrière le disque */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-full blur-3xl transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 26%, transparent) 0%, transparent 66%)",
          opacity: playing ? 0.7 : 0.28,
        }}
      />

      <div
        ref={discRef}
        className="relative aspect-square w-full rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 30% 26%, #34343a 0%, #1a1a1e 40%, #0f0f11 72%, #1d1d21 100%)",
          boxShadow:
            "0 30px 70px -22px rgba(0,0,0,0.75), inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* Sillons du vinyle */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-70"
          style={{
            background:
              "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 4px)",
            maskImage:
              "radial-gradient(circle, transparent 33%, black 35%, black 99%, transparent)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 33%, black 35%, black 99%, transparent)",
          }}
        />
        {/* Anneaux marqués */}
        <div
          aria-hidden
          className="absolute inset-[7%] rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
        />
        <div
          aria-hidden
          className="absolute inset-[19%] rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.045)" }}
        />
        {/* Reflet lumineux balayant la surface */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-55"
          style={{
            background:
              "conic-gradient(from 205deg, transparent 0deg, rgba(255,255,255,0.14) 24deg, transparent 68deg, transparent 188deg, rgba(255,255,255,0.09) 212deg, transparent 258deg)",
          }}
        />

        {/* Étiquette centrale / pochette — jamais de texte de titre */}
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
          style={{
            background:
              "linear-gradient(150deg, color-mix(in oklab, var(--primary) 82%, black), color-mix(in oklab, var(--primary) 45%, black))",
            boxShadow: "0 8px 22px -8px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.16)",
          }}
        >
          {artworkUrl ? (
            <img src={artworkUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>

        {/* Trou central */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[5.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-media"
          style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4)" }}
        />
      </div>
    </div>
  );
}
