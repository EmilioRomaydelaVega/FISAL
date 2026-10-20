import type { z } from "zod";

/**
 * Valida una lista de documentos JSON descartando (y registrando) los que no
 * encajan en el esquema, para que un registro dañado no rompa la pantalla.
 */
export function parseDocuments<T>(schema: z.ZodType<T>, values: readonly unknown[]): T[] {
  const parsed: T[] = [];
  for (const value of values) {
    if (value == null) continue;
    const result = schema.safeParse(value);
    if (result.success) parsed.push(result.data);
    else console.warn("Documento descartado por formato no válido", result.error.issues, value);
  }
  return parsed;
}

export function parseDocument<T>(schema: z.ZodType<T>, value: unknown): T | null {
  return parseDocuments(schema, [value])[0] ?? null;
}
