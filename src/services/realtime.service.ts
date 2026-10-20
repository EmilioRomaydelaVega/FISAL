import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import {
  dailyCheckSchema,
  fleetEntrySchema,
  historyEntrySchema,
  machineSchema,
  type Client,
  type DailyCheck,
  type FleetEntry,
  type HistoryEntry,
  type Machine,
} from "@/types/domain";

import { parseDocument } from "./parse";

/** Cambios de la base de datos que interesan al backoffice. */
export interface BackofficeChangeHandlers {
  onHistoryInserted: (entry: HistoryEntry) => void;
  onHistoryDeleted: (id: string) => void;
  onFleetUpserted: (machineId: string, entry: FleetEntry) => void;
  onFleetDeleted: (machineId: string) => void;
  onMachineInserted: (machine: Machine) => void;
  onMachineDeleted: (id: string) => void;
  onClientUpserted: (client: Client) => void;
  onClientDeleted: (id: string) => void;
  onDailyCheckUpserted: (check: DailyCheck) => void;
  onDailyCheckDeleted: (id: string) => void;
}

type TableName = "inspections" | "fleet" | "custom_machines" | "clients" | "daily_checks";
type Payload<T extends TableName> = RealtimePostgresChangesPayload<Tables<T>>;

/** Escucha los cambios en tiempo real. Devuelve la función para dejar de escuchar. */
export function subscribeToBackofficeChanges(handlers: BackofficeChangeHandlers): () => void {
  const channel = supabase
    .channel("fisalrent-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "inspections" },
      (payload: Payload<"inspections">) => {
        if (payload.eventType === "INSERT") {
          const entry = parseDocument(historyEntrySchema, payload.new.summary ?? payload.new.data);
          if (entry) handlers.onHistoryInserted(entry);
        } else if (payload.eventType === "DELETE") {
          handlers.onHistoryDeleted(payload.old.id ?? "");
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fleet" },
      (payload: Payload<"fleet">) => {
        if (payload.eventType === "DELETE") {
          handlers.onFleetDeleted(payload.old.machine_id ?? "");
          return;
        }
        const entry = parseDocument(fleetEntrySchema, payload.new.data);
        if (entry) handlers.onFleetUpserted(payload.new.machine_id, entry);
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "custom_machines" },
      (payload: Payload<"custom_machines">) => {
        if (payload.eventType === "INSERT") {
          const machine = parseDocument(machineSchema, payload.new.data);
          if (machine) handlers.onMachineInserted(machine);
        } else if (payload.eventType === "DELETE") {
          handlers.onMachineDeleted(payload.old.id ?? "");
        }
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "clients" },
      (payload: Payload<"clients">) => {
        if (payload.eventType === "DELETE") handlers.onClientDeleted(payload.old.id ?? "");
        else handlers.onClientUpserted(payload.new);
      },
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "daily_checks" },
      (payload: Payload<"daily_checks">) => {
        if (payload.eventType === "DELETE") {
          handlers.onDailyCheckDeleted(payload.old.id ?? "");
          return;
        }
        const check = parseDocument(dailyCheckSchema, payload.new.summary);
        if (check) handlers.onDailyCheckUpserted(check);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
