import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { X, Play, GripVertical } from "@/components/icons";
import type { FileEntry } from "@/lib/files/types";
import { FileIcon } from "@/components/files/FileIcon";
import { parseTrackName, fmtTime } from "./format";
import { useT } from "@/lib/i18n";

/** Hauteur fixe d'une ligne : aucune re-mesure pendant le défilement. */
const ROW_HEIGHT = 64;

/**
 * Bottom sheet listing every media file in the current queue.
 *
 * Liste VIRTUALISÉE : seules les lignes réellement visibles (plus une petite
 * marge) sont montées, quel que soit le nombre de pistes. Les miniatures
 * réutilisent exactement le composant du gestionnaire de fichiers
 * ({@link FileIcon}) : même cache natif, même repli typé, aucun langage
 * visuel parallèle. Quand `onReorder` est fourni, chaque ligne peut être
 * déplacée à la poignée sans interrompre la lecture.
 */
export function QueueSheet({
  open,
  onClose,
  entries,
  activeIndex,
  onSelect,
  variant,
  durations,
  pathFor,
  onReorder,
  title,
}: {
  open: boolean;
  onClose: () => void;
  entries: FileEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
  variant: "audio" | "video";
  /** Duration in seconds, keyed by entry.name. Optional; falls back gracefully. */
  durations?: Record<string, number | undefined>;
  /**
   * Absolute path per entry. When provided, real thumbnails are generated
   * natively (and cached) asynchronously, row by row.
   */
  pathFor?: (entry: FileEntry) => string | null;
  /** Active le glisser-déposer de réorganisation. */
  onReorder?: (from: number, to: number) => void;
  title: string;
}) {
  const t = useT();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // La position courante est immédiatement visible, sans rendu intermédiaire.
    const timer = window.setTimeout(() => {
      if (activeIndex >= 0 && activeIndex < entries.length) {
        virtualizer.scrollToIndex(activeIndex, { align: "center" });
      }
    }, 30);
    return () => window.clearTimeout(timer);
  }, [open, activeIndex, entries.length, virtualizer]);

  // ---- Glisser-déposer de réorganisation ----
  const [drag, setDrag] = useState<{ from: number; to: number } | null>(null);
  const dragRef = useRef<{ from: number; to: number } | null>(null);
  dragRef.current = drag;

  const targetFromPointer = useCallback(
    (clientY: number) => {
      const list = listRef.current;
      if (!list) return 0;
      const rect = list.getBoundingClientRect();
      const y = clientY - rect.top + list.scrollTop;
      return Math.max(0, Math.min(entries.length - 1, Math.floor(y / ROW_HEIGHT)));
    },
    [entries.length],
  );

  const startDrag = (index: number, e: React.PointerEvent) => {
    if (!onReorder) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDrag({ from: index, to: index });
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const to = targetFromPointer(e.clientY);
    if (to !== dragRef.current.to) setDrag({ from: dragRef.current.from, to });
  };
  const endDrag = () => {
    const d = dragRef.current;
    setDrag(null);
    if (d && d.from !== d.to) onReorder?.(d.from, d.to);
  };

  // Swipe-down to close.
  const sheetDrag = useRef<{ y: number; ty: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!sheetRef.current) return;
    sheetDrag.current = { y: e.clientY, ty: 0 };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!sheetDrag.current || !sheetRef.current) return;
    const dy = Math.max(0, e.clientY - sheetDrag.current.y);
    sheetDrag.current.ty = dy;
    sheetRef.current.style.transform = `translateY(${dy}px)`;
  };
  const onPointerUp = () => {
    if (!sheetDrag.current || !sheetRef.current) return;
    const ty = sheetDrag.current.ty;
    sheetRef.current.style.transform = "";
    sheetDrag.current = null;
    if (ty > 120) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end" role="dialog" aria-modal>
      <button
        type="button"
        aria-label={t("media.player.queueCloseLabel")}
        onClick={onClose}
        className="absolute inset-0 bg-scrim/60 animate-fade-in"
      />
      <div
        ref={sheetRef}
        className="relative z-10 flex max-h-[75vh] w-full flex-col rounded-t-3xl bg-media/95 text-media-foreground shadow-2xl backdrop-blur-xl sm:mx-auto sm:max-w-lg"
        style={{ animation: "fade-in 0.2s ease-out, scale-in 0.2s ease-out" }}
      >
        <div
          className="flex cursor-grab items-center gap-3 px-5 pb-3 pt-3 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-media-foreground/25" />
        </div>
        <div className="flex items-center gap-3 px-5 pb-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("media.player.aria.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-media-foreground/10 gf-press"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
          <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{title}</p>
          <span className="rounded-full bg-media-foreground/10 px-2 py-0.5 text-[11px] text-media-muted">
            {entries.length}
          </span>
        </div>
        {onReorder ? (
          <p className="px-5 pb-2 text-[11px] text-media-muted">{t("media.player.queueReorder")}</p>
        ) : null}
        <div
          ref={listRef}
          className="overflow-y-auto px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
          style={{
            overscrollBehavior: "contain",
            flex: "1 1 auto",
            minHeight: 0,
            touchAction: drag ? "none" : undefined,
          }}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div style={{ position: "relative", height: `${virtualizer.getTotalSize()}px` }}>
            {virtualizer.getVirtualItems().map((v) => {
              const entry = entries[v.index];
              if (!entry) return null;
              const i = v.index;
              const meta = parseTrackName(entry.name);
              const active = i === activeIndex;
              const dur = durations?.[entry.name];
              const dragging = drag?.from === i;
              const dropTarget = drag != null && drag.to === i && drag.from !== i;
              return (
                <div
                  key={`${entry.name}-${i}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${ROW_HEIGHT}px`,
                    transform: `translateY(${v.start}px)`,
                    contain: "layout paint style",
                    zIndex: dragging ? 2 : undefined,
                  }}
                >
                  <div
                    className={`flex h-full w-full items-center gap-3 rounded-2xl px-2 transition-colors ${
                      dragging ? "scale-[0.99] bg-media-foreground/15 opacity-90" : ""
                    } ${dropTarget ? "ring-1 ring-inset ring-primary/60" : ""} ${
                      active && !dragging ? "bg-media-foreground/10" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(i);
                        onClose();
                      }}
                      className="flex h-full min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="relative shrink-0">
                        <FileIcon
                          kind={entry.kind}
                          size="sm"
                          path={pathFor?.(entry) ?? null}
                          className="!rounded-xl"
                        />
                        {active ? (
                          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-scrim/50">
                            {variant === "audio" ? (
                              <WaveIndicator />
                            ) : (
                              <Play className="h-[16px] w-[16px] text-primary" />
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-[13.5px] font-medium ${
                            active ? "text-primary" : "text-media-foreground"
                          }`}
                        >
                          {meta.title}
                        </p>
                        <p className="truncate text-[11.5px] text-media-muted">
                          {meta.artist ??
                            (variant === "audio"
                              ? t("media.player.unknownArtist")
                              : t("media.player.video"))}
                        </p>
                      </div>
                      {dur ? (
                        <span className="shrink-0 text-[11px] tabular-nums text-media-muted">
                          {fmtTime(dur)}
                        </span>
                      ) : null}
                    </button>
                    {onReorder ? (
                      <span
                        role="button"
                        tabIndex={-1}
                        aria-label={t("media.player.aria.reorder")}
                        onPointerDown={(e) => startDrag(i, e)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-media-muted active:cursor-grabbing"
                      >
                        <GripVertical className="h-[18px] w-[18px]" />
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function WaveIndicator() {
  return (
    <span className="flex h-4 items-end gap-[2px]" aria-hidden>
      <span className="h-2 w-[3px] animate-pulse rounded-sm bg-primary [animation-delay:-.2s]" />
      <span className="h-3.5 w-[3px] animate-pulse rounded-sm bg-primary" />
      <span className="h-2.5 w-[3px] animate-pulse rounded-sm bg-primary [animation-delay:-.4s]" />
    </span>
  );
}
