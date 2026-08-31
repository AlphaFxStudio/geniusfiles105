/**
 * Dialogue de suppression unifié de GeniusFiles.
 *
 * Utilisé partout (gestionnaire, catégories, recherche, fichiers récents,
 * lecteurs image / vidéo) afin que la suppression se comporte exactement
 * de la même façon quel que soit l'endroit d'où elle est déclenchée.
 *
 * Il expose toujours la case « Supprimer définitivement » :
 *  - décochée (par défaut) → l'élément part à la corbeille ;
 *  - cochée → l'élément est détruit sans passer par la corbeille.
 */
import { useEffect, useState } from "react";
import { Check } from "@/components/icons";
import { ConfirmDialog } from "@/components/files/BottomSheet";
import { confirmCopy } from "@/lib/copy";
import { useT } from "@/lib/i18n";

export function DeleteConfirmDialog({
  open,
  count,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  count: number;
  onCancel: () => void;
  /** `permanent` reflète l'état de la case au moment de la validation. */
  onConfirm: (permanent: boolean) => void | Promise<void>;
}) {
  const t = useT();
  const [forever, setForever] = useState(false);

  // Chaque ouverture repart de l'option la plus sûre : la corbeille.
  useEffect(() => {
    if (open) setForever(false);
  }, [open]);

  const copy = forever ? confirmCopy.deleteForever(count) : confirmCopy.moveToTrash(count);

  return (
    <ConfirmDialog
      open={open}
      danger
      title={copy.title}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      extra={
        <button
          type="button"
          className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3.5 text-left text-[14px] font-medium text-foreground"
          onClick={() => setForever((v) => !v)}
          role="checkbox"
          aria-checked={forever}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
              forever
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/50 bg-surface"
            }`}
          >
            {forever ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
          </span>
          {t("copy.confirm.deleteForever.toggle")}
        </button>
      }
      onCancel={onCancel}
      onConfirm={() => onConfirm(forever)}
    />
  );
}
