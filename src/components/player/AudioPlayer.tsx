import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Image as ImageIcon,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Rewind,
  FastForward,
  Shuffle,
  SkipBack,
  SkipForward,
  Waves,
  X,
} from "@/components/icons";
import { VinylDisc } from "./VinylDisc";
import { QueueSheet } from "./QueueSheet";
import { BackgroundSheet } from "./BackgroundSheet";
import { fmtTime, parseTrackName } from "./format";
import { audioStore, useAudioState } from "@/lib/player/audio-store";
import { playerBackgroundUrl, usePlayerBackground } from "@/lib/player/background";
import { audioEditorSearch } from "@/lib/audio/routes";
import { absolutePathOf } from "@/lib/viewer/source";
import { useOverlayZClass } from "@/lib/files/overlay-z";
import { useT } from "@/lib/i18n";

/**
 * Full-screen audio player — premium Android styling.
 *
 * Purely a controlled view over `audioStore`; it never owns an
 * HTMLAudioElement, so opening/closing it cannot interrupt playback.
 * Rendered through a portal on <body> so no transformed ancestor can
 * offset it and no app navigation stays visible behind it.
 *
 * L'arrière-plan plein écran (ambiance fournie ou photo de l'utilisateur)
 * est purement décoratif : il vit derrière un voile sombre calibré pour
 * garantir la lisibilité de chaque texte et de chaque commande.
 */
export function AudioPlayer({ onClose }: { onClose: () => void }) {
  const overlayZ = useOverlayZClass();
  const t = useT();
  const navigate = useNavigate();
  const state = useAudioState();
  const { queue, index, playing, duration, shuffle, repeat, parent, loaded } = state;
  const entry = queue[index];
  const currentParent = state.parents?.[index] ?? parent;
  const canEdit = !!entry && !!currentParent && entry.kind === "audio";
  const [queueOpen, setQueueOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [artworkUrl] = useState<string | null>(null);
  const bg = usePlayerBackground();
  const bgUrl = playerBackgroundUrl(bg);

  const meta = useMemo(() => (entry ? parseTrackName(entry.name) : { title: "" }), [entry]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ---- Smooth position (rAF) instead of the 4 Hz `timeupdate` cadence ----
  const [smoothPos, setSmoothPos] = useState(state.position);
  const scrubRef = useRef<number | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  scrubRef.current = scrub;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = audioStore.getAudioEl();
      if (a && scrubRef.current == null) setSmoothPos(a.currentTime || 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Lock background scroll while the player is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === " ") {
        e.preventDefault();
        audioStore.toggle();
      } else if (e.key === "ArrowRight")
        audioStore.seek((audioStore.getAudioEl()?.currentTime ?? 0) + 10);
      else if (e.key === "ArrowLeft")
        audioStore.seek((audioStore.getAudioEl()?.currentTime ?? 0) - 10);
      else if (e.key === "n") audioStore.next();
      else if (e.key === "p") audioStore.prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ---- Progress bar drag ----
  const barRef = useRef<HTMLDivElement | null>(null);
  const posFromPointer = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar || duration <= 0) return null;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration],
  );

  const skip = (delta: number) => {
    const a = audioStore.getAudioEl();
    audioStore.seek((a?.currentTime ?? smoothPos) + delta);
  };

  const pathFor = useCallback(
    (e: (typeof queue)[number]) => {
      const p = state.parents?.[queue.indexOf(e)] ?? parent;
      return p ? absolutePathOf(p, e) : null;
    },
    [queue, state.parents, parent],
  );

  if (!entry || !parent || !mounted) return null;

  const displayPos = scrub ?? smoothPos;
  const progress = duration > 0 ? Math.min(1, Math.max(0, displayPos / duration)) : 0;

  const bitrate =
    entry.size && duration > 1 ? Math.round((entry.size * 8) / duration / 1000) : null;

  const ui = (
    <div
      className={`fixed inset-0 ${overlayZ} flex flex-col overflow-hidden bg-media text-media-foreground animate-fade-in`}
      role="dialog"
      aria-modal
      aria-label={t("media.player.aria.audioPlayer")}
    >
      {/* Arrière-plan plein écran + voiles de lisibilité */}
      {bgUrl ? (
        <img
          key={bgUrl}
          src={bgUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-105 object-cover opacity-70 animate-fade-in"
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: bgUrl
            ? "linear-gradient(180deg, color-mix(in oklab, var(--media) 55%, transparent) 0%, color-mix(in oklab, var(--media) 72%, transparent) 42%, color-mix(in oklab, var(--media) 94%, transparent) 100%)"
            : "radial-gradient(120% 70% at 50% -10%, color-mix(in oklab, var(--primary) 18%, transparent) 0%, transparent 62%)",
          backdropFilter: bgUrl ? "blur(2px)" : undefined,
        }}
      />

      {/* Barre supérieure — marges Android natives */}
      <header
        className="flex items-center gap-3 px-5 pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <GlassButton onClick={onClose} label={t("media.player.aria.minimize")}>
          <ChevronDown className="h-5 w-5" />
        </GlassButton>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-media-muted">
            {t("media.player.aria.playing")}
          </p>
          <p className="truncate text-[11px] text-media-muted/85">
            {index + 1} / {queue.length}
            {entry.ext ? ` · ${entry.ext.toUpperCase()}` : ""}
          </p>
        </div>
        <GlassButton onClick={() => setBgOpen(true)} label={t("media.player.bg.title")}>
          <ImageIcon className="h-5 w-5" />
        </GlassButton>
        <GlassButton
          onClick={() => {
            audioStore.stop();
            onClose();
          }}
          label={t("media.player.aria.closeStop")}
        >
          <X className="h-5 w-5" />
        </GlassButton>
      </header>

      {/* Disque vinyle */}
      <div className="flex flex-1 items-center justify-center px-8 py-4">
        <div
          key={index}
          className="w-full max-w-[min(72vw,320px)] animate-scale-in"
          style={{ animationDuration: "320ms" }}
        >
          <VinylDisc playing={playing} artworkUrl={artworkUrl} />
        </div>
      </div>

      {/* Informations du morceau : une seule hiérarchie, titre en premier */}
      <section className="px-7 text-center">
        <h2
          key={`t-${index}`}
          className="line-clamp-2 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-media-foreground animate-fade-in"
          title={meta.title}
        >
          {meta.title}
        </h2>
        <p className="mt-2 truncate text-[13.5px] font-medium text-media-muted animate-fade-in">
          {meta.artist ?? t("media.player.unknownArtist")}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {[
            entry.ext ? entry.ext.toUpperCase() : null,
            bitrate ? `${bitrate} kbps` : null,
            duration > 0 ? fmtTime(duration) : loaded ? null : t("media.player.loading"),
          ]
            .filter(Boolean)
            .map((chip) => (
              <span
                key={chip as string}
                className="rounded-full bg-media-foreground/10 px-2.5 py-1 text-[11px] font-medium text-media-muted backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
        </div>
      </section>

      {/* Progression */}
      <div className="px-7 pt-6">
        <div
          ref={barRef}
          className="relative flex h-9 cursor-pointer items-center"
          style={{ touchAction: "none" }}
          role="slider"
          aria-label={t("media.player.aria.progress")}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(displayPos)}
          tabIndex={0}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            const v = posFromPointer(e.clientX);
            if (v != null) setScrub(v);
          }}
          onPointerMove={(e) => {
            if (scrub == null) return;
            const v = posFromPointer(e.clientX);
            if (v != null) setScrub(v);
          }}
          onPointerUp={() => {
            if (scrub != null) audioStore.seek(scrub);
            setScrub(null);
          }}
          onPointerCancel={() => setScrub(null)}
        >
          <div className="absolute inset-x-0 h-[5px] rounded-full bg-media-foreground/20" />
          <div
            className="absolute h-[5px] rounded-full bg-primary"
            style={{
              width: `${progress * 100}%`,
              transition: scrub == null ? "width 90ms linear" : "none",
            }}
          />
          <div
            className="absolute h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_2px_10px_-1px_color-mix(in_oklab,var(--primary)_65%,transparent)]"
            style={{
              left: `${progress * 100}%`,
              transform: `translateX(-50%) scale(${scrub != null ? 1.3 : 1})`,
              transition:
                scrub == null ? "left 90ms linear, transform 150ms ease" : "transform 150ms ease",
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] font-medium tabular-nums text-media-muted">
          <span>{fmtTime(displayPos)}</span>
          <span>{duration > 0 ? fmtTime(duration) : "--:--"}</span>
        </div>
      </div>

      {/* Contrôles principaux — hiérarchie claire autour du bouton central */}
      <div className="flex items-center justify-between gap-2 px-7 pt-5">
        <IconButton
          label={t("media.player.aria.shuffle")}
          active={shuffle}
          onClick={() => audioStore.setShuffle(!shuffle)}
        >
          <Shuffle className="h-[19px] w-[19px]" />
        </IconButton>
        <IconButton
          label={t("media.player.aria.previous")}
          size="lg"
          onClick={() => audioStore.prev()}
        >
          <SkipBack className="h-7 w-7" />
        </IconButton>
        <button
          type="button"
          onClick={() => audioStore.toggle()}
          aria-label={playing ? t("media.player.aria.pause") : t("media.player.aria.play")}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_16px_34px_-12px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition-transform duration-150 active:scale-95"
        >
          {playing ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
        </button>
        <IconButton label={t("media.player.aria.next")} size="lg" onClick={() => audioStore.next()}>
          <SkipForward className="h-7 w-7" />
        </IconButton>
        <IconButton
          label={t("media.player.aria.repeat")}
          active={repeat !== "off"}
          onClick={() =>
            audioStore.setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")
          }
        >
          {repeat === "one" ? (
            <Repeat1 className="h-[19px] w-[19px]" />
          ) : (
            <Repeat className="h-[19px] w-[19px]" />
          )}
        </IconButton>
      </div>

      {/* Contrôles secondaires */}
      <div
        className="flex flex-wrap items-center justify-center gap-2 px-6 pt-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.75rem)" }}
      >
        <SecondaryButton label={t("media.player.aria.rewind10")} onClick={() => skip(-10)}>
          <Rewind className="h-[18px] w-[18px]" />
          10s
        </SecondaryButton>
        <SecondaryButton label={t("media.player.aria.queue")} onClick={() => setQueueOpen(true)}>
          <ListMusic className="h-[18px] w-[18px]" />
          {t("media.player.queueLabel")}
        </SecondaryButton>
        <SecondaryButton label={t("media.player.aria.forward10")} onClick={() => skip(10)}>
          10s
          <FastForward className="h-[18px] w-[18px]" />
        </SecondaryButton>
        <SecondaryButton
          label={t("media.player.aria.editAudio")}
          onClick={() => {
            if (!entry || !currentParent) return;
            audioStore.closeUI();
            void navigate({
              to: "/editeur-audio",
              search: audioEditorSearch(currentParent, entry),
            });
          }}
          disabled={!canEdit}
        >
          <Waves className="h-[18px] w-[18px]" />
          {t("media.player.editLabel")}
        </SecondaryButton>
      </div>

      <QueueSheet
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        entries={queue}
        activeIndex={index}
        onSelect={(i) => audioStore.jumpTo(i)}
        onReorder={(from, to) => audioStore.moveTrack(from, to)}
        pathFor={pathFor}
        variant="audio"
        title={t("media.player.queueTitle")}
      />
      <BackgroundSheet open={bgOpen} onClose={() => setBgOpen(false)} />
    </div>
  );

  return createPortal(ui, document.body);
}

function GlassButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-media-foreground/10 text-media-foreground backdrop-blur-md transition-transform active:scale-95"
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  active,
  size = "md",
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 ${
        size === "lg" ? "h-14 w-14" : "h-11 w-11"
      } ${active ? "bg-primary/20 text-primary" : "text-media-foreground/85 hover:bg-media-foreground/10"}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex items-center gap-1.5 rounded-full bg-media-foreground/10 px-4 py-2 text-[12px] font-medium text-media-foreground/90 backdrop-blur-md transition-all duration-150 active:scale-95 hover:bg-media-foreground/15 ${disabled ? "cursor-not-allowed opacity-45 active:scale-100" : ""}`}
    >
      {children}
    </button>
  );
}
