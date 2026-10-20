import { useEffect, useState } from "react";

import { DEFAULT_MACHINE_ICON } from "@/constants/machines";
import { localDateStamp } from "@/lib/dates";
import { fetchCheckedMachineIds } from "@/services/daily-checks.service";
import { fetchFleetRecords } from "@/services/fleet.service";
import { fetchMachines } from "@/services/machines.service";
import type { ClientSession, FleetEntry, Machine } from "@/types/domain";

export interface PortalMachine {
  machine: Machine;
  fleet: FleetEntry;
  checkedToday: boolean;
}

interface PortalMachinesState {
  loading: boolean;
  machines: PortalMachine[];
}

/** Máquinas asignadas al cliente y si ya tienen el parte de hoy. */
export function usePortalMachines(session: ClientSession): PortalMachinesState {
  const [state, setState] = useState<PortalMachinesState>({ loading: true, machines: [] });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [fleet, machines, checked] = await Promise.all([
        fetchFleetRecords().catch(() => []),
        fetchMachines().catch(() => []),
        fetchCheckedMachineIds(session.id, localDateStamp()).catch(() => new Set<string>()),
      ]);
      const machinesById = new Map(machines.map((machine) => [String(machine.id), machine]));
      const assigned = fleet
        .filter(({ entry }) => entry.clientId === session.id)
        .map(({ machineId, entry }) => ({
          machine: machinesById.get(machineId) ?? {
            id: machineId,
            name: machineId,
            serial: "",
            category: "",
            image: DEFAULT_MACHINE_ICON,
          },
          fleet: entry,
          checkedToday: checked.has(machineId),
        }));
      if (!cancelled) setState({ loading: false, machines: assigned });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [session.id]);

  return state;
}
