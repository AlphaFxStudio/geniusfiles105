/**
 * Feuille « Détails » unifiée.
 *
 * Aucune information utile n'est tronquée : le nom complet et
 * l'emplacement complet sont affichés sur plusieurs lignes, avec
 * césure propre pour les chemins très longs. Un bouton permet
 * d'ouvrir directement l'emplacement dans le gestionnaire, où
 * l'élément est mis en évidence.
 */
import { formatDate, formatSize, kindLabel } from "@/lib/files/format";
import type { DetailsInfo } from "@/lib/files/operations";
import { FileIcon } from "./FileIcon";
import { kindOf } from "@/lib/files/format";
import { BottomSheet, PrimaryButton } from "./BottomSheet";
import { useT } from "@/lib/i18n";
import { requestFileJump } from "@/lib/files/deeplink";
import { useAppNavigate } from "@/lib/navigation/pick-nav";

export function DetailsSheet({
  open,
  info,
  onClose,
}: {
  open: boolean;
  info: DetailsInfo | null;
  onClose: () => void;
}) {
  const t = useT();
  const navigate = useAppNavigate();
  if (!info) return null;
  const kind = kindOf(info.name, info.isDirectory);
  const typeLabel = info.isDirectory ? kindLabel(kind) : kindLabel(kind, info.ext);

  const openLocation = () => {
    onClose();
    requestFileJump({
      rootId: info.parent.rootId,
      segments: [...info.parent.segments],
      file: info.name,
    });
    void navigate({ to: "/" });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("action.details")}
      footer={
        <>
          <PrimaryButton variant="ghost" onClick={openLocation}>
            {t("files.details.openLocation")}
          </PrimaryButton>
          <PrimaryButton onClick={onClose}>{t("action.close")}</PrimaryButton>
        </>
      }
    >
      <div className="mb-4 flex items-start gap-3">
        <FileIcon kind={kind} size="lg" path={info.path} />
        <div className="min-w-0">
          <p className="break-words text-[15px] font-semibold leading-snug text-foreground">
            {info.name}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">{typeLabel}</p>
        </div>
      </div>
      <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
        <Row label={t("files.details.name")} value={info.name} />
        <Row label={t("files.details.location")} value={info.path} mono />
        <Row label={t("files.details.type")} value={typeLabel} />
        <Row label={t("files.details.size")} value={formatSize(info.size)} />
        {info.isDirectory ? (
          <Row
            label={t("files.details.content")}
            value={info.itemCount != null ? t("count.files", { count: info.itemCount }) : "—"}
          />
        ) : null}
        <Row label={t("files.details.modified")} value={formatDate(info.mtime)} />
        {!info.isDirectory && info.ext ? (
          <Row label={t("files.details.extension")} value={`.${info.ext}`} />
        ) : null}
      </dl>
    </BottomSheet>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="px-3.5 py-2.5 text-[13px]">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={`mt-0.5 break-words text-foreground ${mono ? "font-mono text-[12px] leading-relaxed" : ""}`}
        style={{ overflowWrap: "anywhere" }}
      >
        {value}
      </dd>
    </div>
  );
}
