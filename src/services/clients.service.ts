import { supabase } from "@/lib/supabase";
import type { NewClient } from "@/lib/domain/clients";
import type { Client } from "@/types/domain";
import type { TablesUpdate } from "@/types/database";

import { assertOk, unwrap, unwrapOptional } from "./result";

export async function fetchClients(): Promise<Client[]> {
  return unwrap(
    await supabase.from("clients").select("*").order("created_at", { ascending: true }),
    "No se pudieron cargar los clientes",
  );
}

export type ClientUpdate = TablesUpdate<"clients">;

export async function insertClient(client: NewClient): Promise<void> {
  assertOk(await supabase.from("clients").insert(client), "No se pudo guardar");
}

export async function updateClient(id: string, changes: ClientUpdate): Promise<void> {
  assertOk(await supabase.from("clients").update(changes).eq("id", id), "No se pudo guardar");
}

export async function deleteClient(id: string): Promise<void> {
  assertOk(await supabase.from("clients").delete().eq("id", id), "No se pudo eliminar");
}

export type PortalClient = Pick<Client, "id" | "name" | "access_code" | "active">;

/** Busca el cliente del portal por su código de acceso. */
export async function findClientByAccessCode(code: string): Promise<PortalClient | null> {
  return unwrapOptional(
    await supabase
      .from("clients")
      .select("id, name, access_code, active")
      .eq("access_code", code)
      .maybeSingle(),
    "No se pudo comprobar el código",
  );
}
