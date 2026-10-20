import { createClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/types/database";

import { env } from "./env";

/** Cliente único de Supabase. Solo debe importarse desde la capa de servicios. */
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } },
);

/**
 * Convierte un documento del dominio en el tipo `Json` de las columnas jsonb.
 * Los documentos son objetos planos serializables, así que la conversión es segura.
 */
export function toJson(value: object): Json {
  return value as Json;
}
