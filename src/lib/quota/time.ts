/**
 * Horloge de confiance des quotas.
 *
 * L'heure affichée par le téléphone est modifiable en deux gestes : elle ne
 * peut donc pas décider seule qu'un nouveau jour a commencé. Ce module
 * fournit une référence temporelle beaucoup plus difficile à manipuler :
 *
 *  - référence serveur (`/api/public/time`) dès qu'un réseau est disponible ;
 *  - progression **monotone** en session via `performance.now()` (insensible
 *    à un changement d'heure pendant que l'application tourne) ;
 *  - « ligne de flottaison » persistée : le temps de confiance ne recule
 *    jamais, même après un redémarrage complet de l'application ;
 *  - détection de manipulation : tout recul de l'horloge de l'appareil, ou
 *    tout bond en avant anormal, marque l'horloge comme suspecte tant qu'une
 *    référence serveur n'a pas été obtenue.
 *
 * Le fuseau horaire n'entre jamais en jeu : les journées de quota sont
 * calculées en UTC, donc voyager ne crée ni ne supprime d'utilisation.
 */

const CLOCK_KEY = "gf.quota.clock";
/** Tolérance de recul (petits ajustements NTP légitimes). */
const BACKWARD_TOLERANCE_MS = 2 * 60 * 1000;
/** Bond en avant au-delà duquel l'horloge locale devient suspecte. */
const FORWARD_JUMP_MS = 12 * 60 * 60 * 1000;

type ClockState = {
  /** Plus haut instant de confiance jamais observé (ms epoch). */
  hi: number;
  /** Heure appareil au dernier enregistrement (détection de recul). */
  dev: number;
  /** Horloge appareil jugée non fiable jusqu'à la prochaine synchro serveur. */
  tampered: boolean;
};

type Anchor = { serverMs: number; perf: number };

let anchor: Anchor | null = null;
let state: ClockState | null = null;
let syncing: Promise<boolean> | null = null;

function nowPerf(): number {
  try {
    return typeof performance !== "undefined" ? performance.now() : Date.now();
  } catch {
    return Date.now();
  }
}

function read(): ClockState {
  if (state) return state;
  let parsed: Partial<ClockState> | null = null;
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(CLOCK_KEY);
    parsed = raw ? (JSON.parse(raw) as Partial<ClockState>) : null;
  } catch {
    parsed = null;
  }
  state = {
    hi: Number(parsed?.hi) || 0,
    dev: Number(parsed?.dev) || 0,
    tampered: Boolean(parsed?.tampered),
  };
  return state;
}

function write(next: ClockState): void {
  state = next;
  try {
    window.localStorage.setItem(CLOCK_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : la session reste cohérente en mémoire */
  }
}

/** `true` si une référence serveur a été obtenue pendant cette session. */
export function clockVerified(): boolean {
  return anchor !== null && !read().tampered;
}

/** `true` si l'horloge de l'appareil a été jugée manipulée. */
export function clockSuspect(): boolean {
  return read().tampered && anchor === null;
}

/**
 * Instant de confiance courant (ms epoch).
 * Ne recule jamais et ignore les sauts d'horloge locale en session.
 */
export function trustedNow(): number {
  const s = read();
  const device = Date.now();
  let value: number;

  if (anchor) {
    value = anchor.serverMs + Math.max(0, nowPerf() - anchor.perf);
  } else {
    let tampered = s.tampered;
    if (s.hi > 0 && device < s.hi - BACKWARD_TOLERANCE_MS) tampered = true;
    if (s.dev > 0 && device > s.dev + FORWARD_JUMP_MS) tampered = true;
    value = tampered ? Math.max(s.hi, 0) : Math.max(s.hi, device);
    if (tampered !== s.tampered) write({ ...s, tampered, dev: device });
  }

  const cur = read();
  if (value > cur.hi || device !== cur.dev) {
    write({ hi: Math.max(cur.hi, value), dev: device, tampered: cur.tampered });
  }
  return Math.max(value, read().hi);
}

/**
 * Synchronise l'horloge sur le serveur (best-effort, non bloquant).
 * Une seule requête à la fois ; hors ligne, l'appel échoue en silence.
 */
export function syncTrustedTime(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (syncing) return syncing;
  syncing = (async () => {
    try {
      const res = await fetch("/api/public/time", { cache: "no-store" });
      if (!res.ok) return false;
      const body = (await res.json()) as { now?: unknown };
      const serverMs = Number(body?.now);
      if (!Number.isFinite(serverMs) || serverMs <= 0) return false;
      anchor = { serverMs, perf: nowPerf() };
      const s = read();
      write({ hi: Math.max(s.hi, serverMs), dev: Date.now(), tampered: false });
      return true;
    } catch {
      return false;
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

/** Clé de journée (UTC) — indépendante du fuseau horaire de l'appareil. */
export function utcDayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Instant du prochain renouvellement (minuit UTC suivant). */
export function nextRenewalMs(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0);
}
