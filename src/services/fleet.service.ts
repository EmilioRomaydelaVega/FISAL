import { supabase, toJson } from "@/lib/supabase";
import { fleetEntrySchema, type FleetEntry, type FleetMap } from "@/types/domain";

import { parseDocument } from "./parse";
import { assertOk, unwrap } from "./result";

export interface FleetRecord {
  machineId: string;
  entry: FleetEntry;
}

export async function fetchFleetRecords(): Promise<FleetRecord[]> {
  const rows = unwrap(
    await supabase.from("fleet").select("machine_id, data"),
    "No se pudo cargar la flota",
  );
  return rows.flatMap((row) => {
    const entry = parseDocument(fleetEntrySchema, row.data);
    return entry ? [{ machineId: row.machine_id, entry }] : [];
  });
}

export async function fetchFleet(): Promise<FleetMap> {
  const records = await fetchFleetRecords();
  return Object.fromEntries(records.map(({ machineId, entry }) => [machineId, entry]));
}

export async function saveFleetEntry(machineId: string, entry: FleetEntry): Promise<void> {
  assertOk(
    await supabase.from("fleet").upsert({
      machine_id: machineId,
      data: toJson(entry),
      updated_at: new Date().toISOString(),
    }),
    "No se pudo guardar la ficha de flota",
  );
}
