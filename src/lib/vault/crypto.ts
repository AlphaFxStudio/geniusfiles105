/**
 * Coffre-fort — gestion de la clé maître de chiffrement.
 *
 * Modèle :
 *  - une clé maître aléatoire de 32 octets (AES-256) est générée à la
 *    création du coffre-fort. Elle n'est JAMAIS écrite en clair ;
 *  - elle est enveloppée (AES-256-GCM) par une clé de chiffrement de clé
 *    (KEK) dérivée du code / PIN / schéma via PBKDF2-SHA256 (210 000
 *    itérations, sel aléatoire de 16 octets). Le code lui-même n'est donc
 *    jamais utilisé directement comme clé ;
 *  - une seconde enveloppe optionnelle, dérivée d'un secret d'appareil
 *    conservé dans les SharedPreferences privées de l'application, permet
 *    le déverrouillage biométrique — et seulement après validation
 *    effective du capteur ;
 *  - la clé maître déchiffrée vit UNIQUEMENT en mémoire, le temps où le
 *    coffre-fort est déverrouillé. `clearMasterKey()` l'efface (remise à
 *    zéro des octets) au verrouillage.
 *
 * Rien ne sort de l'appareil : aucune clé, aucun sel, aucun octet de
 * fichier n'est transmis à Genius AI, Firebase, AdMob ou tout autre tiers.
 */

const STORE_KEY = "gf.vault.masterkey";
const PBKDF2_ITERATIONS = 210_000;

type WrappedKeyRecord = {
  v: 1;
  salt: string;
  iterations: number;
  /** base64(iv | clé maître chiffrée) — enveloppe par le code utilisateur. */
  wrapped: string;
  /** base64(iv | clé maître chiffrée) — enveloppe par le secret d'appareil. */
  deviceWrapped?: string;
};

/* La clé en clair ne quitte jamais ce module. */
let memoryKey: Uint8Array | null = null;

/* ---------------- encodage ---------------- */

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function toBase64(bytes: Uint8Array): string {
  let str = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    str += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(str);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ---------------- persistance de l'enveloppe ---------------- */

function readRecord(): WrappedKeyRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WrappedKeyRecord;
    return parsed?.wrapped ? parsed : null;
  } catch {
    return null;
  }
}

function writeRecord(rec: WrappedKeyRecord | null): void {
  if (typeof window === "undefined") return;
  try {
    if (rec) window.localStorage.setItem(STORE_KEY, JSON.stringify(rec));
    else window.localStorage.removeItem(STORE_KEY);
  } catch {
    /* quota — l'appelant traitera l'absence de clé comme un échec */
  }
}

/* ---------------- dérivation ---------------- */

async function deriveKek(secret: string, saltHex: string, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  const salt = hexToBytes(saltHex);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Le secret d'appareil est déjà à haute entropie : un SHA-256 suffit. */
async function deriveDeviceKek(deviceSecret: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(deviceSecret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function deviceSecret(): Promise<string | null> {
  try {
    const { isAndroidNative, nativePlugin } = await import("@/lib/native/geniusfiles-native");
    if (!isAndroidNative()) return null;
    const p = nativePlugin();
    if (!p?.vaultDeviceSecret) return null;
    const r = await p.vaultDeviceSecret();
    return r?.secret ?? null;
  } catch {
    return null;
  }
}

async function wrap(kek: CryptoKey, key: Uint8Array): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      kek,
      key as unknown as BufferSource,
    ),
  );
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return toBase64(out);
}

async function unwrap(kek: CryptoKey, wrapped: string): Promise<Uint8Array | null> {
  try {
    const raw = fromBase64(wrapped);
    const iv = raw.subarray(0, 12);
    const ct = raw.subarray(12);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      kek,
      ct as unknown as BufferSource,
    );
    const bytes = new Uint8Array(plain);
    return bytes.length === 32 ? bytes : null;
  } catch {
    return null;
  }
}

/* ---------------- API ---------------- */

/** Le coffre-fort possède-t-il déjà une clé maître enveloppée ? */
export function hasWrappedMasterKey(): boolean {
  return readRecord() !== null;
}

/** La clé maître est-elle disponible en mémoire (coffre déverrouillé) ? */
export function isMasterKeyLoaded(): boolean {
  return memoryKey !== null;
}

/** Clé maître au format base64, pour les appels de chiffrement natifs. */
export function masterKeyBase64(): string | null {
  return memoryKey ? toBase64(memoryKey) : null;
}

/** Efface la clé de la mémoire (verrouillage automatique ou manuel). */
export function clearMasterKey(): void {
  if (memoryKey) memoryKey.fill(0);
  memoryKey = null;
}

/**
 * Crée la clé maître à la configuration du coffre-fort. Idempotent : si
 * une enveloppe existe déjà, elle est conservée telle quelle.
 */
export async function createMasterKey(secret: string, biometric: boolean): Promise<void> {
  if (readRecord()) return;
  const key = crypto.getRandomValues(new Uint8Array(32));
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const kek = await deriveKek(secret, salt, PBKDF2_ITERATIONS);
  const rec: WrappedKeyRecord = {
    v: 1,
    salt,
    iterations: PBKDF2_ITERATIONS,
    wrapped: await wrap(kek, key),
  };
  writeRecord(rec);
  memoryKey = key;
  if (biometric) await enableDeviceUnwrap();
}

/** Déverrouille la clé maître à partir du code utilisateur. */
export async function unlockMasterKeyWithSecret(secret: string): Promise<boolean> {
  const rec = readRecord();
  if (!rec) {
    // Coffre-fort antérieur au chiffrement : on crée la clé maintenant,
    // la migration des fichiers existants s'appuiera dessus.
    await createMasterKey(secret, false);
    return memoryKey !== null;
  }
  const kek = await deriveKek(secret, rec.salt, rec.iterations || PBKDF2_ITERATIONS);
  const key = await unwrap(kek, rec.wrapped);
  if (!key) return false;
  memoryKey = key;
  return true;
}

/**
 * Déverrouille la clé maître via le secret d'appareil. À n'appeler
 * qu'après une validation biométrique réussie.
 */
export async function unlockMasterKeyWithDevice(): Promise<boolean> {
  const rec = readRecord();
  if (!rec?.deviceWrapped) return false;
  const secret = await deviceSecret();
  if (!secret) return false;
  const key = await unwrap(await deriveDeviceKek(secret), rec.deviceWrapped);
  if (!key) return false;
  memoryKey = key;
  return true;
}

/** Ajoute l'enveloppe « appareil » (déverrouillage biométrique). */
export async function enableDeviceUnwrap(): Promise<boolean> {
  const rec = readRecord();
  if (!rec || !memoryKey) return false;
  const secret = await deviceSecret();
  if (!secret) return false;
  writeRecord({ ...rec, deviceWrapped: await wrap(await deriveDeviceKek(secret), memoryKey) });
  return true;
}

/** Retire l'enveloppe « appareil ». */
export function disableDeviceUnwrap(): void {
  const rec = readRecord();
  if (!rec) return;
  const next = { ...rec };
  delete next.deviceWrapped;
  writeRecord(next);
}

/**
 * Réenveloppe la clé maître avec un nouveau code. La clé — et donc les
 * fichiers déjà chiffrés — reste inchangée.
 */
export async function rewrapMasterKey(nextSecret: string): Promise<boolean> {
  const rec = readRecord();
  if (!rec || !memoryKey) return false;
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
  const kek = await deriveKek(nextSecret, salt, PBKDF2_ITERATIONS);
  writeRecord({
    ...rec,
    salt,
    iterations: PBKDF2_ITERATIONS,
    wrapped: await wrap(kek, memoryKey),
  });
  return true;
}

/** Réinitialisation complète : l'enveloppe et la clé disparaissent. */
export function forgetMasterKey(): void {
  clearMasterKey();
  writeRecord(null);
}
