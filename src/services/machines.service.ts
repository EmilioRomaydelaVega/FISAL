import { supabase, toJson } from "@/lib/supabase";
import { machineSchema, type Machine } from "@/types/domain";

import { parseDocument, parseDocuments } from "./parse";
import { assertOk, unwrap, unwrapOptional } from "./result";

/** Catálogo de máquinas en orden de alta. */
export async function fetchMachines(): Promise<Machine[]> {
  const rows = unwrap(
    await supabase.from("custom_machines").select("data").order("created_at", { ascending: true }),
    "No se pudieron cargar las máquinas",
  );
  return parseDocuments(
    machineSchema,
    rows.map((row) => row.data),
  );
}

export async function fetchMachine(id: string): Promise<Machine | null> {
  const row = unwrapOptional(
    await supabase.from("custom_machines").select("data").eq("id", id).maybeSingle(),
    "No se pudo cargar la máquina",
  );
  return parseDocument(machineSchema, row?.data);
}

export async function insertMachine(machine: Machine): Promise<void> {
  assertOk(
    await supabase
      .from("custom_machines")
      .insert({ id: String(machine.id), data: toJson(machine) }),
    "No se pudo guardar la máquina",
  );
}

export async function deleteMachine(id: Machine["id"]): Promise<void> {
  assertOk(
    await supabase.from("custom_machines").delete().eq("id", String(id)),
    "No se pudo eliminar la máquina",
  );
}
