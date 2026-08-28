import { useRef, useState } from "react";
import { Check, Image as ImageIcon, Plus, X } from "@/components/icons";
import {
  PLAYER_BACKGROUNDS,
  importCustomBackground,
  setPlayerBackground,
  usePlayerBackground,
  type PlayerBackgroundId,
} from "@/lib/player/background";
import { useT } from "@/lib/i18n";

/**
 * Feuille de sélection de l'arrière-plan du lecteur : quelques ambiances
 * fournies, l'image de l'utilisateur, ou aucun fond. Le changement est
 * appliqué immédiatement, sans jamais toucher à la lecture.
 */
export function BackgroundSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const bg = usePlayerBackground();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const pick = (id: PlayerBackgroundId) => setPlayerBackground(id);

  return (
    <div className="fixed inset-0 z-[75] flex items-end" role="dialog" aria-modal>
      <button
        type="button"
        aria-label={t("media.player.aria.close")}
        onClick={onClose}
        className="absolute inset-0 bg-scrim/60 animate-fade-in"
      />
      <div
        className="relative z-10 w-full rounded-t-3xl bg-media/95 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] text-media-foreground shadow-2xl backdrop-blur-xl sm:mx-auto sm:max-w-lg"
        style={{ animation: "fade-in 0.2s ease-out, scale-in 0.2s ease-out" }}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-media-foreground/25" />
        <div className="flex items-center gap-3 px-5 pb-1 pt-4">
          <p className="min-w-0 flex-1 text-[15px] font-semibold">{t("media.player.bg.title")}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("media.player.aria.close")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-media-foreground/10"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <p className="px-5 pb-3 text-[12px] text-media-muted">{t("media.player.bg.hint")}</p>

        <div className="grid grid-cols-3 gap-3 px-5 pb-4">
          <Tile
            selected={bg.id === "none"}
            label={t("media.player.bg.none")}
            onClick={() => pick("none")}
          >
            <span className="flex h-full w-full items-center justify-center bg-media-foreground/5">
              <ImageIcon className="h-5 w-5 text-media-muted" />
            </span>
          </Tile>

          {PLAYER_BACKGROUNDS.map((p) => (
            <Tile
              key={p.id}
              selected={bg.id === p.id}
              label={t(p.labelKey)}
              onClick={() => pick(p.id)}
            >
              <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </Tile>
          ))}

          <Tile
            selected={bg.id === "custom"}
            label={t("media.player.bg.custom")}
            onClick={() => fileRef.current?.click()}
          >
            {bg.custom ? (
              <img src={bg.custom} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-media-foreground/5">
                <Plus className={`h-5 w-5 text-media-muted ${busy ? "animate-pulse" : ""}`} />
              </span>
            )}
          </Tile>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            await importCustomBackground(file);
            setBusy(false);
          }}
        />
      </div>
    </div>
  );
}

function Tile({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="group flex flex-col gap-1.5 text-left transition-transform active:scale-95"
    >
      <span
        className={`relative block aspect-[3/4] w-full overflow-hidden rounded-2xl ${
          selected ? "ring-2 ring-primary" : "ring-1 ring-media-foreground/12"
        }`}
      >
        {children}
        {selected ? (
          <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </span>
      <span className="truncate text-[11px] text-media-muted">{label}</span>
    </button>
  );
}
