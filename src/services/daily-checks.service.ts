import { supabase, toJson } from "@/lib/supabase";
import { dailyCheckSchema, type DailyCheck } from "@/types/domain";

import { parseDocuments } from "./parse";
import { assertOk, unwrap } from "./result";

const BACKOFFICE_LIMIT = 500;

/** Últimos partes (sin fotos) para el backoffice. */
export async function fetchRecentDailyChecks(): Promise<DailyCheck[]> {
  const rows = unwrap(
    await supabase
      .from("daily_checks")
      .select("summary, check_date")
      .order("check_date", { ascending: false })
      .limit(BACKOFFICE_LIMIT),
    "No se pudieron cargar los partes diarios",
  );
  return parseDocuments(
    dailyCheckSchema,
    rows.map((row) => row.summary),
  );
}

/** Ids de máquina que ya tienen parte del cliente en la fecha indicada. */
export async function fetchCheckedMachineIds(clientId: string, date: string): Promise<Set<string>> {
  const rows = unwrap(
    await supabase
      .from("daily_checks")
      .select("machine_id")
      .eq("client_id", clientId)
      .eq("check_date", date),
    "No se pudieron cargar los partes de hoy",
  );
  return new Set(rows.map((row) => row.machine_id));
}

/** Partes anteriores de una máquina y cliente, del más reciente al más antiguo. */
export async function fetchMachineDailyChecks(
  machineId: string,
  clientId: string,
  limit: number,
): Promise<DailyCheck[]> {
  const rows = unwrap(
    await supabase
      .from("daily_checks")
      .select("summary, check_date")
      .eq("machine_id", machineId)
      .eq("client_id", clientId)
      .order("check_date", { ascending: false })
      .limit(limit),
    "No se pudieron cargar los partes anteriores",
  );
  return parseDocuments(
    dailyCheckSchema,
    rows.map((row) => row.summary),
  );
}

/** Crea o sustituye el parte de una máquina para su fecha. */
export async function saveDailyCheck(check: DailyCheck): Promise<void> {
  assertOk(
    await supabase.from("daily_checks").upsert(
      {
        id: check.id ?? `${check.machineId}_${check.date}`,
        client_id: check.clientId,
        machine_id: check.machineId,
        check_date: check.date,
        data: toJson(check),
      },
      { onConflict: "machine_id,check_date" },
    ),
    "No se pudo guardar",
  );
}

/** Elimina un parte por id o, en registros antiguos sin id, por máquina y fecha. */
export async function deleteDailyCheck(check: DailyCheck): Promise<void> {
  const query = supabase.from("daily_checks").delete();
  const filtered = check.id
    ? query.eq("id", check.id)
    : query.eq("machine_id", check.machineId).eq("check_date", check.date);
  assertOk(await filtered, "No se pudo eliminar el parte");
}
