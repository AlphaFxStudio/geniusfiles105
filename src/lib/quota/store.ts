/**
 * Quotas quotidiens des fonctionnalités freemium (Genius AI, Automatisations).
 *
 * Règles :
 *  - 3 utilisations gratuites par jour et par fonctionnalité, indépendantes ;
 *  - chaque message Genius AI / chaque exécution d'automatisation = 1 unité ;
 *  - une annonce récompensée regardée jusqu'au bout ajoute 1 utilisation ;
 *  - renouvellement à minuit UTC, décidé par l'horloge de confiance
 *    (`./time`) et jamais par la seule date affichée par le téléphone.
 *
 * Intégrité : l'état est signé. Toute modification manuelle du stockage
 * est détectée et neutralisée (quota du jour épuisé, jamais rechargé).
 *
 * Aucune donnée personnelle n'est enregistrée : uniquement des compteurs.
 */
import { clockSuspect, clockVerified, syncTrustedTime, trustedNow, utcDayKey } from "./time";

export type QuotaFeature = "assistant" | "automations";

/** Utilisations offertes chaque jour, par fonctionnalité. */
export const FREE_DAILY_USES = 3;
/** Bonus maximal accumulable par jour via les annonces récompensées. */
export const MAX_DAILY_BONUS = 10;

export type QuotaSnapshot = {
  feature: QuotaFeature;
  /** Utilisations restantes (gratuites + bonus). */
  remaining: number;
  /** Total disponible aujourd'hui. */
  total: number;
  used: number;
  bonus: number;
  /** `true` si une annonce peut encore ajouter une utilisation. */
  canEarn: boolean;
  /** Renouvellement en attente d'une vérification de l'heure. */
  pendingRenewal: boolean;
};

type FeatureState = {
  day: string;
  used: number;
  bonus: number;
  /** Instant de confiance du dernier renouvellement appliqué. */
  resetAt: number;
};

type QuotaState = {
  v: 1;
  features: Record<QuotaFeature, FeatureState>;
  /** Récompenses déjà encaissées (anti-rejeu). */
  nonces: string[];
  /** Réservations en cours : jeton → fonctionnalité. */
  holds: Record<string, QuotaFeature>;
};

const STORAGE_KEY = "gf.quota.state";
const SIGNATURE_SALT = "geniusfiles/quota/v1";
/** Sans référence serveur, on n'accepte un renouvellement qu'au-delà de ce délai. */
const OFFLINE_RENEWAL_MS = 20 * 60 * 60 * 1000;

const FEATURES: readonly QuotaFeature[] = ["assistant", "automations"];

const listeners = new Set<() => void>();
let state: QuotaState | null = null;
let snapshots: Record<QuotaFeature, QuotaSnapshot> | null = null;

function emptyFeature(day: string, at: number): FeatureState {
  return { day, used: 0, bonus: 0, resetAt: at };
}

function sign(payload: string): string {
  /* Empreinte courte (FNV-1a) : dissuade la modification manuelle du
     stockage sans prétendre à une garantie cryptographique côté client. */
  let hash = 0x811c9dc5;
  const input = `${payload}|${SIGNATURE_SALT}`;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

function blankState(now: number): QuotaState {
  const day = utcDayKey(now);
  return {
    v: 1,
    features: {
      assistant: emptyFeature(day, now),
      automations: emptyFeature(day, now),
    },
    nonces: [],
    holds: {},
  };
}

/** État « épuisé » appliqué quand une falsification est détectée. */
function exhaustedState(now: number): QuotaState {
  const base = blankState(now);
  for (const feature of FEATURES) base.features[feature].used = FREE_DAILY_USES;
  return base;
}

function normalizeFeature(raw: unknown, day: string, now: number): FeatureState {
  const value = (raw ?? {}) as Partial<FeatureState>;
  return {
    day: typeof value.day === "string" ? value.day : day,
    used: Math.max(0, Math.floor(Number(value.used) || 0)),
    bonus: Math.min(MAX_DAILY_BONUS, Math.max(0, Math.floor(Number(value.bonus) || 0))),
    resetAt: Number(value.resetAt) || now,
  };
}

function load(): QuotaState {
  if (state) return state;
  const now = trustedNow();
  if (typeof window === "undefined") {
    state = blankState(now);
    return state;
  }
  let next: QuotaState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      next = blankState(now);
    } else {
      const box = JSON.parse(raw) as { data?: unknown; sig?: unknown };
      const data = typeof box?.data === "string" ? box.data : "";
      if (!data || sign(data) !== box?.sig) {
        next = exhaustedState(now);
      } else {
        const parsed = JSON.parse(data) as Partial<QuotaState>;
        const day = utcDayKey(now);
        next = {
          v: 1,
          features: {
            assistant: normalizeFeature(parsed.features?.assistant, day, now),
            automations: normalizeFeature(parsed.features?.automations, day, now),
          },
          nonces: Array.isArray(parsed.nonces) ? parsed.nonces.slice(-40).map(String) : [],
          holds:
            parsed.holds && typeof parsed.holds === "object"
              ? (parsed.holds as Record<string, QuotaFeature>)
              : {},
        };
      }
    }
  } catch {
    next = exhaustedState(now);
  }
  state = next;
  return state;
}

function persist(): void {
  if (!state) return;
  snapshots = null;
  try {
    const data = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, sig: sign(data) }));
  } catch {
    /* stockage indisponible : l'état reste valable pour la session */
  }
  for (const listener of listeners) listener();
}

/**
 * Applique le renouvellement quotidien si — et seulement si — l'heure de
 * confiance le justifie. Hors ligne et sans preuve suffisante, le quota
 * reste inchangé : avancer la date du téléphone ne recharge rien.
 */
function rollover(feature: QuotaFeature): { changed: boolean; pending: boolean } {
  const s = load();
  const now = trustedNow();
  const day = utcDayKey(now);
  const current = s.features[feature];
  if (current.day === day) return { changed: false, pending: false };

  if (current.day > day) {
    /* Journée enregistrée dans le futur : horloge manipulée, on attend. */
    return { changed: false, pending: true };
  }

  const allowed =
    clockVerified() || (!clockSuspect() && now - current.resetAt >= OFFLINE_RENEWAL_MS);
  if (!allowed) {
    void syncTrustedTime();
    return { changed: false, pending: true };
  }

  s.features[feature] = emptyFeature(day, now);
  return { changed: true, pending: false };
}

function refresh(feature: QuotaFeature): boolean {
  const { changed } = rollover(feature);
  if (changed) persist();
  return changed;
}

/** Instantané courant du quota d'une fonctionnalité. */
export function quotaSnapshot(feature: QuotaFeature): QuotaSnapshot {
  const { pending } = rollover(feature);
  const s = load();
  const f = s.features[feature];
  const total = FREE_DAILY_USES + f.bonus;
  if (!snapshots) snapshots = {} as Record<QuotaFeature, QuotaSnapshot>;
  const cached = snapshots[feature];
  const next: QuotaSnapshot = {
    feature,
    remaining: Math.max(0, total - f.used),
    total,
    used: f.used,
    bonus: f.bonus,
    canEarn: f.bonus < MAX_DAILY_BONUS,
    pendingRenewal: pending,
  };
  if (
    cached &&
    cached.remaining === next.remaining &&
    cached.total === next.total &&
    cached.used === next.used &&
    cached.bonus === next.bonus &&
    cached.canEarn === next.canEarn &&
    cached.pendingRenewal === next.pendingRenewal
  ) {
    return cached;
  }
  snapshots[feature] = next;
  return next;
}

/** S'abonner aux évolutions des quotas. */
export function subscribeQuota(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** `true` s'il reste au moins une utilisation disponible. */
export function hasQuota(feature: QuotaFeature): boolean {
  return quotaSnapshot(feature).remaining > 0;
}

export type QuotaHold = { token: string; feature: QuotaFeature };

/**
 * Réserve une utilisation **avant** de lancer l'opération.
 *
 * Le débit est immédiat (impossible de lancer plusieurs opérations
 * simultanées avec une seule utilisation) mais réversible : si l'opération
 * ne peut pas démarrer, `releaseQuota` rend l'utilisation.
 */
export function reserveQuota(feature: QuotaFeature): QuotaHold | null {
  refresh(feature);
  const s = load();
  const f = s.features[feature];
  if (f.used >= FREE_DAILY_USES + f.bonus) return null;
  const token = `${feature}-${f.day}-${f.used}-${Math.random().toString(36).slice(2, 10)}`;
  f.used += 1;
  s.holds[token] = feature;
  persist();
  return { token, feature };
}

/** Confirme définitivement une réservation (opération réellement lancée). */
export function commitQuota(hold: QuotaHold | null): void {
  if (!hold) return;
  const s = load();
  if (!s.holds[hold.token]) return;
  delete s.holds[hold.token];
  persist();
}

/** Rend une utilisation réservée dont l'opération n'a pas pu démarrer. */
export function releaseQuota(hold: QuotaHold | null): void {
  if (!hold) return;
  const s = load();
  if (!s.holds[hold.token]) return;
  delete s.holds[hold.token];
  const f = s.features[hold.feature];
  /* Un renouvellement a pu survenir entre-temps : on ne crédite jamais
     au-delà de ce qui a été consommé. */
  if (f.used > 0) f.used -= 1;
  persist();
}

/**
 * Crédite une utilisation après une annonce récompensée réellement terminée.
 *
 * Le `nonce` est généré avant l'affichage et renvoyé par la couche native
 * uniquement si la récompense a été validée par le SDK : rejouer le même
 * jeton ne crédite rien.
 */
export function grantRewardedUse(feature: QuotaFeature, nonce: string): boolean {
  if (!nonce) return false;
  refresh(feature);
  const s = load();
  if (s.nonces.includes(nonce)) return false;
  const f = s.features[feature];
  if (f.bonus >= MAX_DAILY_BONUS) return false;
  f.bonus += 1;
  s.nonces = [...s.nonces, nonce].slice(-40);
  persist();
  return true;
}

/** Synchronise l'horloge puis applique un éventuel renouvellement en attente. */
export async function refreshQuotas(): Promise<void> {
  await syncTrustedTime();
  let changed = false;
  for (const feature of FEATURES) changed = refresh(feature) || changed;
  if (!changed) {
    snapshots = null;
    for (const listener of listeners) listener();
  }
}
