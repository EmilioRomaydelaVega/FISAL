import { useEffect, useReducer, type Dispatch } from "react";

import { fetchClients } from "@/services/clients.service";
import { fetchRecentDailyChecks } from "@/services/daily-checks.service";
import { fetchFleet } from "@/services/fleet.service";
import { fetchHistory } from "@/services/inspections.service";
import { fetchMachines } from "@/services/machines.service";
import { subscribeToBackofficeChanges } from "@/services/realtime.service";

import {
  backofficeReducer,
  initialBackofficeState,
  type BackofficeAction,
  type BackofficeState,
} from "./backoffice-store";

function settledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  if (result.status === "fulfilled") return result.value;
  console.error(result.reason);
  return undefined;
}

/**
 * Carga inicial de todos los datos del backoffice y sincronización en tiempo
 * real entre dispositivos. Si una consulta falla, el resto se muestra igual.
 */
export function useBackofficeData(): [BackofficeState, Dispatch<BackofficeAction>] {
  const [state, dispatch] = useReducer(backofficeReducer, initialBackofficeState);

  useEffect(() => {
    let cancelled = false;

    void Promise.allSettled([
      fetchHistory(),
      fetchFleet(),
      fetchMachines(),
      fetchClients(),
      fetchRecentDailyChecks(),
    ]).then(([history, fleet, machines, clients, dailyChecks]) => {
      if (cancelled) return;
      dispatch({
        type: "loaded",
        data: {
          history: settledValue(history),
          fleet: settledValue(fleet),
          machines: settledValue(machines),
          clients: settledValue(clients),
          dailyChecks: settledValue(dailyChecks),
        },
      });
    });

    const unsubscribe = subscribeToBackofficeChanges({
      onHistoryInserted: (entry) => dispatch({ type: "historyAdded", entry }),
      onHistoryDeleted: (id) => dispatch({ type: "historyRemoved", id }),
      onFleetUpserted: (machineId, entry) => dispatch({ type: "fleetSet", machineId, entry }),
      onFleetDeleted: (machineId) => dispatch({ type: "fleetRemoved", machineId }),
      onMachineInserted: (machine) => dispatch({ type: "machineAdded", machine }),
      onMachineDeleted: (id) => dispatch({ type: "machineRemoved", id }),
      onClientUpserted: (client) => dispatch({ type: "clientUpserted", client }),
      onClientDeleted: (id) => dispatch({ type: "clientRemoved", id }),
      onDailyCheckUpserted: (check) => dispatch({ type: "dailyCheckUpserted", check }),
      onDailyCheckDeleted: (id) => dispatch({ type: "dailyCheckRemovedById", id }),
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return [state, dispatch];
}
