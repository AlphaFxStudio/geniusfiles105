/**
 * Gestion centralisée des conflits de copie / déplacement.
 *
 * Un seul point d'entrée pour toute l'application : le gestionnaire de
 * transferts (`manager.ts`) demande ici la résolution des conflits avant
 * de lancer l'opération. Tous les écrans (gestionnaire, catégories,
 * récents, sélections, sélecteurs de destination) passent par ce même
 * chemin, donc le comportement est strictement identique partout.
 *
 * Principes :
 *  - détection groupée (un seul aller-retour de vérification par groupe) ;
 *  - aucun dialogue lorsqu'aucun conflit n'existe ;
 *  - un conflit à la fois, résolu séquentiellement ;
 *  - « appliquer à tous » valable uniquement pour l'opération en cours ;
 *  - notification système si l'application n'est pas visible.
 */
import type { FileEntry, PathRef } from "@/lib/files/types";
import { namesStillPresent } from "@/lib/files/verify";
import { showNotification } from "@/lib/native/notifications";
import { t } from "@/lib/i18n";

/**
 * Décisions possibles :
 *  - `overwrite` : l'élément existant est remplacé ;
 *  - `rename`    : les deux sont conservés, le nouvel élément reçoit un
 *                  suffixe « (1) », « (2) »… ;
 *  - `skip`      : cet élément n'est pas transféré, l'opération continue
 *                  avec les suivants.
 */
export type ConflictChoice = "overwrite" | "rename" | "skip";

export type ConflictPrompt = {
  id: number;
  name: string;
  isDirectory: boolean;
  mode: "copy" | "move";
  destLabel: string;
  /** Conflits restants après celui-ci (0 = dernier). */
  remaining: number;
  /** L'opération porte sur plusieurs éléments (case « appliquer à tous »). */
  multiple?: boolean;
};

export type ConflictAnswer = { choice: ConflictChoice; applyToAll: boolean };

type Waiter = (answer: ConflictAnswer) => void;

let current: ConflictPrompt | null = null;
let waiter: Waiter | null = null;
let nextId = 1;
/** Sérialise les demandes : deux tâches ne s'affichent jamais ensemble. */
let chain: Promise<unknown> = Promise.resolve();

const listeners = new Set<() => void>();

export function subscribeConflicts(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getConflictPrompt(): ConflictPrompt | null {
  return current;
}

function publish() {
  for (const l of listeners) l();
}

/** Réponse de l'utilisateur (dialogue) — sans effet si rien n'est en attente. */
export function answerConflict(choice: ConflictChoice, applyToAll: boolean) {
  const resolve = waiter;
  waiter = null;
  current = null;
  publish();
  resolve?.({ choice, applyToAll });
}

function notifyIfHidden() {
  if (typeof document === "undefined" || document.visibilityState === "visible") return;
  void showNotification({
    title: t("ops.conflict.notifyTitle"),
    body: t("ops.conflict.notifyBody"),
    route: "/",
  });
}

/** Affiche un conflit et attend la décision. Un seul à la fois. */
export function requestConflictDecision(
  prompt: Omit<ConflictPrompt, "id">,
): Promise<ConflictAnswer> {
  const run = () =>
    new Promise<ConflictAnswer>((resolve) => {
      current = { ...prompt, id: nextId++ };
      waiter = resolve;
      publish();
      notifyIfHidden();
    });
  const next = chain.then(run, run);
  chain = next.catch(() => undefined);
  return next;
}

export type ConflictGroup = { parent: PathRef; entries: FileEntry[] };

export type ConflictResolution = {
  /** Groupes purgés des éléments ignorés (peut être vide). */
  groups: ConflictGroup[];
  /** Noms explicitement autorisés à écraser l'existant. */
  overwrite: Set<string>;
  /** Nom d'origine → nom unique à utiliser à destination. */
  renames: Map<string, string>;
  /** Éléments non transférés à la demande de l'utilisateur. */
  skipped: number;
  /** Conservé pour compatibilité : l'utilisateur ne stoppe plus tout. */
  cancelled: boolean;
};

function samePath(a: PathRef, b: PathRef): boolean {
  return a.rootId === b.rootId && a.segments.join("/") === b.segments.join("/");
}

/** Découpe « photo.jpg » en « photo » + « .jpg » (jamais pour un dossier). */
export function splitBaseExt(name: string, isDirectory: boolean): { base: string; ext: string } {
  if (isDirectory) return { base: name, ext: "" };
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { base: name, ext: "" };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
}

/**
 * Cherche un nom libre à destination : « photo (1).jpg », « photo (2).jpg »…
 * Une seule vérification groupée, sans scan du stockage.
 */
export async function findFreeName(
  destination: PathRef,
  name: string,
  isDirectory: boolean,
  reserved: Set<string>,
): Promise<string> {
  const { base, ext } = splitBaseExt(name, isDirectory);
  const candidates: string[] = [];
  for (let i = 1; i <= 50; i++) {
    const candidate = `${base} (${i})${ext}`;
    if (!reserved.has(candidate)) candidates.push(candidate);
  }
  let taken = new Set<string>();
  try {
    taken = await namesStillPresent(destination, candidates);
  } catch {
    /* vérification impossible : on garde le premier candidat libre connu */
  }
  const pick = candidates.find((c) => !taken.has(c)) ?? `${base} (${Date.now()})${ext}`;
  reserved.add(pick);
  return pick;
}

/**
 * Détecte les doublons à destination puis demande une décision, un
 * élément à la fois. Retourne le plan d'exécution réellement souhaité.
 */
export async function resolveTransferConflicts(input: {
  mode: "copy" | "move";
  groups: ConflictGroup[];
  destination: PathRef;
  destLabel: string;
}): Promise<ConflictResolution> {
  const { mode, groups, destination, destLabel } = input;
  const overwrite = new Set<string>();
  const renames = new Map<string, string>();

  // ── Détection : un seul contrôle groupé par groupe source.
  const conflicting = new Set<string>();
  for (const group of groups) {
    // Copier/déplacer dans le dossier d'origine : comportement inchangé.
    if (samePath(group.parent, destination)) continue;
    const names = group.entries.map((e) => e.name);
    if (names.length === 0) continue;
    try {
      const present = await namesStillPresent(destination, names);
      for (const n of present) conflicting.add(n);
    } catch {
      /* vérification impossible : on n'invente pas de conflit */
    }
  }

  if (conflicting.size === 0) return { groups, overwrite, renames, skipped: 0, cancelled: false };

  let blanket: ConflictChoice | null = null;
  const skippedNames = new Set<string>();
  const reserved = new Set<string>();
  const total = groups.reduce((n, g) => n + g.entries.length, 0);
  let remaining = conflicting.size;

  for (const group of groups) {
    for (const entry of group.entries) {
      if (!conflicting.has(entry.name)) continue;
      remaining--;
      let choice: ConflictChoice | null = blanket;
      if (!choice) {
        const answer = await requestConflictDecision({
          name: entry.name,
          isDirectory: entry.isDirectory,
          mode,
          destLabel,
          remaining,
          multiple: total > 1 || conflicting.size > 1,
        });
        choice = answer.choice;
        if (answer.applyToAll) blanket = choice;
      }
      if (choice === "skip") skippedNames.add(entry.name);
      else if (choice === "rename")
        renames.set(
          entry.name,
          await findFreeName(destination, entry.name, entry.isDirectory, reserved),
        );
      else overwrite.add(entry.name);
    }
  }

  const kept = groups
    .map((g) => ({ parent: g.parent, entries: g.entries.filter((e) => !skippedNames.has(e.name)) }))
    .filter((g) => g.entries.length > 0);

  return { groups: kept, overwrite, renames, skipped: skippedNames.size, cancelled: false };
}
