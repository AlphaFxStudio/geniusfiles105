import type { QuotaFeature } from "./store";

/** Levée quand une opération freemium n'a plus d'utilisation disponible. */
export class QuotaExceededError extends Error {
  readonly feature: QuotaFeature;

  constructor(feature: QuotaFeature) {
    super(`quota-exceeded:${feature}`);
    this.name = "QuotaExceededError";
    this.feature = feature;
  }
}

/** `true` si l'erreur correspond à un quota épuisé. */
export function isQuotaExceeded(err: unknown): err is QuotaExceededError {
  return err instanceof QuotaExceededError;
}
