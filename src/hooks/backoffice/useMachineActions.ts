import { useCallback, type Dispatch } from "react";

import { createId } from "@/lib/ids";
import { notify } from "@/lib/notify";
import { firstIssue, machineFormSchema, type MachineFormValues } from "@/lib/validation";
import { deleteMachine, insertMachine } from "@/services/machines.service";
import type { Machine } from "@/types/domain";

import type { BackofficeAction } from "./backoffice-store";

export interface MachineActions {
  /** Valida y da de alta la máquina. Devuelve `true` si se ha añadido. */
  addMachine: (values: MachineFormValues) => boolean;
  removeMachine: (machine: Machine) => void;
}

export function useMachineActions(dispatch: Dispatch<BackofficeAction>): MachineActions {
  const addMachine = useCallback(
    (values: MachineFormValues) => {
      const result = machineFormSchema.safeParse(values);
      if (!result.success) {
        notify.error(firstIssue(result.error));
        return false;
      }
      const machine: Machine = { id: createId.machine(), ...result.data };
      dispatch({ type: "machineAdded", machine });
      insertMachine(machine).catch((error: unknown) => {
        console.error(error);
      });
      notify.success("Máquina añadida correctamente");
      return true;
    },
    [dispatch],
  );

  const removeMachine = useCallback(
    (machine: Machine) => {
      dispatch({ type: "machineRemoved", id: String(machine.id) });
      deleteMachine(machine.id).catch((error: unknown) => {
        console.error(error);
      });
      notify.success("Máquina eliminada");
    },
    [dispatch],
  );

  return { addMachine, removeMachine };
}
