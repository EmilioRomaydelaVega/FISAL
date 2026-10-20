import { useCallback, type Dispatch } from "react";

import { notify } from "@/lib/notify";
import { deleteDailyCheck } from "@/services/daily-checks.service";
import type { DailyCheck } from "@/types/domain";

import type { BackofficeAction } from "./backoffice-store";

export function useDailyCheckActions(dispatch: Dispatch<BackofficeAction>) {
  const removeDailyCheck = useCallback(
    async (check: DailyCheck) => {
      try {
        await deleteDailyCheck(check);
      } catch {
        notify.error("No se pudo eliminar el parte");
        return;
      }
      dispatch({ type: "dailyCheckRemoved", check });
      notify.success("Parte diario eliminado");
    },
    [dispatch],
  );

  return { removeDailyCheck };
}
