import { isSameDailyCheck } from "@/lib/domain/daily-checks";
import { sameId } from "@/lib/text";
import type {
  Client,
  DailyCheck,
  FleetEntry,
  FleetMap,
  HistoryEntry,
  Machine,
} from "@/types/domain";

/** Estado compartido por todas las secciones del backoffice. */
export interface BackofficeState {
  loading: boolean;
  history: HistoryEntry[];
  fleet: FleetMap;
  machines: Machine[];
  clients: Client[];
  dailyChecks: DailyCheck[];
}

export const initialBackofficeState: BackofficeState = {
  loading: true,
  history: [],
  fleet: {},
  machines: [],
  clients: [],
  dailyChecks: [],
};

export type BackofficeAction =
  | { type: "loaded"; data: Partial<Omit<BackofficeState, "loading">> }
  | { type: "historyAdded"; entry: HistoryEntry }
  | { type: "historyRemoved"; id: string }
  | { type: "fleetSet"; machineId: string; entry: FleetEntry }
  | { type: "fleetRemoved"; machineId: string }
  | { type: "machineAdded"; machine: Machine }
  | { type: "machineRemoved"; id: string }
  | { type: "clientUpserted"; client: Client }
  | { type: "clientPatched"; id: string; changes: Partial<Client> }
  | { type: "clientRemoved"; id: string }
  | { type: "dailyCheckUpserted"; check: DailyCheck }
  | { type: "dailyCheckRemoved"; check: DailyCheck }
  | { type: "dailyCheckRemovedById"; id: string };

function withoutId<T extends { id: string | number }>(items: readonly T[], id: string): T[] {
  return items.filter((item) => !sameId(item.id, id));
}

export function backofficeReducer(
  state: BackofficeState,
  action: BackofficeAction,
): BackofficeState {
  switch (action.type) {
    case "loaded":
      return { ...state, ...action.data, loading: false };

    case "historyAdded":
      if (state.history.some((entry) => sameId(entry.id, action.entry.id))) return state;
      return { ...state, history: [action.entry, ...state.history] };
    case "historyRemoved":
      return { ...state, history: withoutId(state.history, action.id) };

    case "fleetSet":
      return { ...state, fleet: { ...state.fleet, [action.machineId]: action.entry } };
    case "fleetRemoved": {
      const { [action.machineId]: _removed, ...fleet } = state.fleet;
      return { ...state, fleet };
    }

    case "machineAdded":
      if (state.machines.some((machine) => sameId(machine.id, action.machine.id))) return state;
      return { ...state, machines: [...state.machines, action.machine] };
    case "machineRemoved":
      return { ...state, machines: withoutId(state.machines, action.id) };

    case "clientUpserted": {
      const exists = state.clients.some((client) => client.id === action.client.id);
      const clients = exists
        ? state.clients.map((client) => (client.id === action.client.id ? action.client : client))
        : [...state.clients, action.client];
      return { ...state, clients };
    }
    case "clientPatched":
      return {
        ...state,
        clients: state.clients.map((client) =>
          client.id === action.id ? { ...client, ...action.changes } : client,
        ),
      };
    case "clientRemoved":
      return { ...state, clients: state.clients.filter((client) => client.id !== action.id) };

    case "dailyCheckUpserted":
      return {
        ...state,
        dailyChecks: [
          action.check,
          ...state.dailyChecks.filter((check) => !sameId(check.id ?? "", action.check.id ?? "")),
        ],
      };
    case "dailyCheckRemoved":
      return {
        ...state,
        dailyChecks: state.dailyChecks.filter((check) => !isSameDailyCheck(check, action.check)),
      };
    case "dailyCheckRemovedById":
      return {
        ...state,
        dailyChecks: state.dailyChecks.filter((check) => !sameId(check.id ?? "", action.id)),
      };
  }
}
