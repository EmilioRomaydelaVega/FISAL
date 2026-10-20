/** Devuelve `singular` o `plural` según la cantidad. */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

export function normalizeText(value: string | undefined): string {
  return (value ?? "").toLowerCase().trim();
}

export function sameId(a: string | number, b: string | number): boolean {
  return String(a) === String(b);
}

/** Sustituye los caracteres no seguros para nombres de archivo. */
export function toSafeFileName(value: string, allowed = /[^a-zA-Z0-9._-]/g): string {
  return value.replace(allowed, "_");
}
