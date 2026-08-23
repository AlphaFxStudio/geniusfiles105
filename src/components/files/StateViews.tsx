import { useEffect, useState } from "react";
import { RotateCcw, ArrowLeft, ExternalLink, ShieldCheck, HardDrive } from "@/components/icons";
import { IllustratedEmptyState } from "@/components/ui/IllustratedEmptyState";
import { ListSkeleton } from "@/components/ui/states";
import { emptyActionLabel } from "@/lib/copy/empty-illustrations";
import { useT } from "@/lib/i18n";

/**
 * Squelette affiché uniquement quand l'attente est RÉELLE : une lecture de
 * dossier qui répond en moins de 140 ms n'affiche plus de squelette du
 * tout, ce qui supprime le clignotement « page en cours de chargement »
 * sans jamais masquer une attente perceptible.
 */
export function LoadingState() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 140);
    return () => window.clearTimeout(id);
  }, []);
  if (!visible) return <div aria-hidden className="h-[420px]" />;
  return <ListSkeleton rows={7} />;
}

export function EmptyFolder({
  onCreateFolder,
  atRoot = false,
}: {
  onCreateFolder?: () => void;
  /** À la racine d'un stockage on parle de « fichiers », sinon de « dossier vide ». */
  atRoot?: boolean;
}) {
  const t = useT();
  return (
    <IllustratedEmptyState
      id={atRoot ? "files" : "folder"}
      adSlot="empty-folder"
      action={
        onCreateFolder ? (
          <button onClick={onCreateFolder} className="btn-primary gf-press">
            {t("action.newFolder")}
          </button>
        ) : null
      }
    />
  );
}

/** Permission refusée — l'utilisateur peut accorder l'accès aux fichiers. */
export function DeniedState({ onGrant }: { onGrant?: () => void }) {
  return (
    <IllustratedEmptyState
      id="permission"
      action={
        onGrant ? (
          <button onClick={onGrant} className="btn-primary gf-press">
            <ShieldCheck className="h-4 w-4" />
            {emptyActionLabel("allow")}
          </button>
        ) : null
      }
    />
  );
}

/** Stockage inaccessible — emplacement momentanément injoignable. */
export function UnavailableState({ onRetry }: { onRetry?: () => void }) {
  return (
    <IllustratedEmptyState
      id="storage"
      action={
        onRetry ? (
          <button onClick={onRetry} className="btn-secondary gf-press">
            <RotateCcw className="h-4 w-4" />
            {emptyActionLabel("retry")}
          </button>
        ) : null
      }
    />
  );
}

/** Erreur réseau — connexion Internet indisponible. */
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <IllustratedEmptyState
      id="network"
      action={
        onRetry ? (
          <button onClick={onRetry} className="btn-secondary gf-press">
            <RotateCcw className="h-4 w-4" />
            {emptyActionLabel("retry")}
          </button>
        ) : null
      }
    />
  );
}

/** Fichier introuvable — la cible a été déplacée ou supprimée. */
export function FileNotFoundState({
  description,
  onBack,
}: {
  description?: string;
  onBack?: () => void;
}) {
  return (
    <IllustratedEmptyState
      id="notFound"
      adSlot="empty-not-found"
      description={description}
      action={
        onBack ? (
          <button onClick={onBack} className="btn-secondary gf-press">
            <ArrowLeft className="h-4 w-4" />
            {emptyActionLabel("back")}
          </button>
        ) : null
      }
    />
  );
}

/** Ouverture impossible — aucun lecteur interne ne sait afficher ce fichier. */
export function OpenFailedState({
  description,
  onOpenWith,
}: {
  description?: string;
  onOpenWith?: () => void;
}) {
  return (
    <IllustratedEmptyState
      id="openFailed"
      description={description}
      action={
        onOpenWith ? (
          <button onClick={onOpenWith} className="btn-primary gf-press">
            <ExternalLink className="h-4 w-4" />
            {emptyActionLabel("openWith")}
          </button>
        ) : null
      }
    />
  );
}

/**
 * Échec de lecture d'un emplacement : on réutilise l'illustration
 * « stockage inaccessible » et on conserve le message technique en
 * complément lorsqu'il est disponible.
 */
export function ErrorState({ message, onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <IllustratedEmptyState
      id="storage"
      description={message}
      action={
        <button onClick={onRetry} className="btn-secondary gf-press">
          <RotateCcw className="h-4 w-4" />
          {emptyActionLabel("retry")}
        </button>
      }
    />
  );
}

/** Mémoire insuffisante — l'opération ne peut pas aboutir faute d'espace. */
export function LowSpaceState({
  description,
  onFreeSpace,
  onRetry,
}: {
  description?: string;
  onFreeSpace?: () => void;
  onRetry?: () => void;
}) {
  return (
    <IllustratedEmptyState
      id="lowSpace"
      description={description}
      action={
        onFreeSpace || onRetry ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {onFreeSpace ? (
              <button onClick={onFreeSpace} className="btn-primary gf-press">
                <HardDrive className="h-4 w-4" />
                {emptyActionLabel("freeSpace")}
              </button>
            ) : null}
            {onRetry ? (
              <button onClick={onRetry} className="btn-secondary gf-press">
                <RotateCcw className="h-4 w-4" />
                {emptyActionLabel("retry")}
              </button>
            ) : null}
          </div>
        ) : null
      }
    />
  );
}

/** Erreur inconnue — incident inattendu, la seule action utile est de réessayer. */
export function UnknownErrorState({
  description,
  onRetry,
}: {
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <IllustratedEmptyState
      id="unknownError"
      description={description}
      action={
        onRetry ? (
          <button onClick={onRetry} className="btn-primary gf-press">
            <RotateCcw className="h-4 w-4" />
            {emptyActionLabel("retry")}
          </button>
        ) : null
      }
    />
  );
}

/** Échec d'une opération — l'action demandée n'a pas pu être exécutée. */
export function OperationFailedState({
  description,
  onRetry,
  onBack,
}: {
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
}) {
  return (
    <IllustratedEmptyState
      id="operationFailed"
      description={description}
      action={
        onRetry || onBack ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {onRetry ? (
              <button onClick={onRetry} className="btn-primary gf-press">
                <RotateCcw className="h-4 w-4" />
                {emptyActionLabel("retry")}
              </button>
            ) : null}
            {onBack ? (
              <button onClick={onBack} className="btn-secondary gf-press">
                <ArrowLeft className="h-4 w-4" />
                {emptyActionLabel("back")}
              </button>
            ) : null}
          </div>
        ) : null
      }
    />
  );
}
