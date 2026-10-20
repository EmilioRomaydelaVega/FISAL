import { supabase, toJson } from "@/lib/supabase";
import {
  historyEntrySchema,
  inspectionSchema,
  type HistoryEntry,
  type Inspection,
} from "@/types/domain";

import { parseDocument, parseDocuments } from "./parse";
import { assertOk, unwrap, unwrapOptional } from "./result";

/** Historial sin fotos (columna `summary`), del más reciente al más antiguo. */
export async function fetchHistory(): Promise<HistoryEntry[]> {
  const rows = unwrap(
    await supabase.from("inspections").select("summary").order("created_at", { ascending: false }),
    "No se pudo cargar el historial",
  );
  return parseDocuments(
    historyEntrySchema,
    rows.map((row) => row.summary),
  );
}

/** Inspección completa, con fotos, para generar el PDF. */
export async function fetchFullInspection(id: Inspection["id"]): Promise<Inspection | null> {
  const row = unwrapOptional(
    await supabase.from("inspections").select("data").eq("id", String(id)).maybeSingle(),
    "No se pudo cargar la inspección",
  );
  return parseDocument(inspectionSchema, row?.data);
}

/** Guarda una inspección o un alquiler archivado. */
export async function insertHistoryEntry(entry: HistoryEntry): Promise<void> {
  assertOk(
    await supabase.from("inspections").insert({ id: String(entry.id), data: toJson(entry) }),
    "No se pudo guardar",
  );
}

export async function deleteHistoryEntry(id: HistoryEntry["id"]): Promise<void> {
  assertOk(await supabase.from("inspections").delete().eq("id", String(id)), "No se pudo eliminar");
}
