import { ChevronUp, Pause, Play, SkipBack, SkipForward, X } from "@/components/icons";
import { audioStore, useAudioState } from "@/lib/player/audio-store";
import { AudioPlayer } from "./AudioPlayer";
import { FileIcon } from "@/components/files/FileIcon";
import { parseTrackName } from "./format";
import { absolutePathOf } from "@/lib/viewer/source";
import { useT } from "@/lib/i18n";
import { BACK_PRIORITY, useBackHandler } from "@/lib/navigation/back-stack";

/**
 * Surface audio persistante montée une seule fois au niveau de l'AppShell.
 *
 * - Affiche le lecteur plein écran quand le drapeau d'interface du store
 *   est actif (ouvert depuis la visionneuse ou depuis le mini-lecteur).
 * - Sinon, affiche le mini-lecteur au-dessus de la barre de navigation dès
 *   qu'une piste est chargée — l'audio lui-même ne dépend jamais de ce
 *   montage : masquer ou fermer la barre n'interrompt pas la lecture.
 */
export function PlayerHost() {
  const s = useAudioState();
  // Retour Android : quand le lecteur plein écran est ouvert, le retour
  // le referme et redonne l'écran précédent — jamais de sortie de l'app.
  useBackHandler(
    s.uiOpen,
    () => {
      audioStore.closeUI();
      return true;
    },
    BACK_PRIORITY.overlay,
  );
  const entry = s.queue[s.index];
  if (!entry) return null;

  if (s.uiOpen) return <AudioPlayer onClose={() => audioStore.closeUI()} />;
  return s.miniHidden ? <MiniHandle /> : <MiniPlayer />;
}

/** Pastille discrète permettant de rappeler la barre masquée. */
function MiniHandle() {
  const t = useT();
  return (
    <div
      data-gf-ad-blocker
      className="fixed inset-x-0 z-40 mx-auto flex max-w-[520px] justify-end px-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.5rem)" }}
    >
      <button
        type="button"
        onClick={() => audioStore.setMiniHidden(false)}
        aria-label={t("media.player.aria.showMini")}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border/60 bg-background/95 px-3 text-[11px] font-medium text-foreground/85 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.6)] backdrop-blur gf-press"
      >
        <ChevronUp className="h-4 w-4" />
        {t("media.player.miniShow")}
      </button>
    </div>
  );
}

function MiniPlayer() {
  const t = useT();
  const s = useAudioState();
  const entry = s.queue[s.index];
  if (!entry) return null;
  const meta = parseTrackName(entry.name);
  const parent = s.parents?.[s.index] ?? s.parent;
  const path = parent ? absolutePathOf(parent, entry) : null;
  const progress = s.duration > 0 ? Math.min(1, s.position / s.duration) : 0;

  return (
    <div
      /* Couche basse : aucune bannière publicitaire ne peut être posée
         par-dessus le mini-lecteur ni ses commandes. */
      data-gf-ad-blocker
      className="fixed inset-x-0 z-40 mx-auto flex max-w-[520px] justify-center px-2"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 4.25rem)" }}
    >
      <div className="relative flex w-full items-center gap-2 overflow-hidden rounded-2xl border border-border/60 bg-background/95 py-1.5 pl-2 pr-1 shadow-[0_10px_28px_-14px_rgba(0,0,0,0.55)] backdrop-blur">
        <button
          type="button"
          onClick={() => audioStore.openUI()}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left active:scale-[0.99]"
          aria-label={t("media.player.aria.openPlayer")}
        >
          {/* Même système de miniature que le gestionnaire et les catégories. */}
          <FileIcon kind={entry.kind} size="sm" path={path} className="!rounded-xl" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-foreground">
              {meta.title}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {meta.artist ?? t("media.player.unknownArtist")}
            </span>
          </span>
        </button>

        <MiniAction label={t("media.player.aria.previous")} onClick={() => audioStore.prev()}>
          <SkipBack className="h-[17px] w-[17px]" />
        </MiniAction>
        <button
          type="button"
          onClick={() => audioStore.toggle()}
          aria-label={s.playing ? t("media.player.aria.pause") : t("media.player.aria.play")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
        >
          {s.playing ? (
            <Pause className="h-[17px] w-[17px]" />
          ) : (
            <Play className="ml-0.5 h-[17px] w-[17px]" />
          )}
        </button>
        <MiniAction label={t("media.player.aria.next")} onClick={() => audioStore.next()}>
          <SkipForward className="h-[17px] w-[17px]" />
        </MiniAction>
        <MiniAction
          label={t("media.player.aria.hideMini")}
          onClick={() => audioStore.setMiniHidden(true)}
        >
          <ChevronUp className="h-[17px] w-[17px] rotate-180" />
        </MiniAction>
        <MiniAction label={t("media.player.aria.stop")} onClick={() => audioStore.stop()}>
          <X className="h-[17px] w-[17px]" />
        </MiniAction>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function MiniAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full text-foreground/75 transition-transform active:scale-90"
    >
      {children}
    </button>
  );
}
