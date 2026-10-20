import { useCallback, type Dispatch } from "react";

import { needsFullInspection } from "@/lib/domain/inspections";
import { getErrorDetail } from "@/lib/errors";
import { notify } from "@/lib/notify";
import { downloadInspectionReport } from "@/lib/pdf/inspection-report";
import {
  deleteHistoryEntry,
  fetchFullInspection,
  insertHistoryEntry,
} from "@/services/inspections.service";
import type { HistoryEntry, Inspection } from "@/types/domain";

import type { BackofficeAction } from "./backoffice-store";

export interface HistoryActions {
  /** Añade la inspección al historial, descarga su PDF y la guarda. */
  submitInspection: (inspection: Inspection) => Promise<void>;
  removeEntry: (entry: HistoryEntry, successMessage: string) => Promise<void>;
  downloadReport: (inspection: Inspection) => Promise<void>;
}

export function useHistoryActions(dispatch: Dispatch<BackofficeAction>): HistoryActions {
  const submitInspection = useCallback(
    async (inspection: Inspection) => {
      dispatch({ type: "historyAdded", entry: inspection });
      downloadInspectionReport(inspection).catch((error: unknown) => {
        console.error(error);
      });
      try {
        await insertHistoryEntry(inspection);
        notify.success(
          inspection.type === "salida"
            ? "Inspección de salida registrada · PDF descargado"
            : "Inspección de entrada registrada · PDF descargado",
        );
      } catch (error) {
        console.error(error);
        dispatch({ type: "historyRemoved", id: String(inspection.id) });
        notify.error(`Error al guardar la inspección: ${getErrorDetail(error)}`);
      }
    },
    [dispatch],
  );

  const removeEntry = useCallback(
    async (entry: HistoryEntry, successMessage: string) => {
      try {
        await deleteHistoryEntry(entry.id);
        dispatch({ type: "historyRemoved", id: String(entry.id) });
        notify.success(successMessage);
      } catch (error) {
        notify.error(`Error al eliminar: ${getErrorDetail(error)}`);
      }
    },
    [dispatch],
  );

  const downloadReport = useCallback(async (inspection: Inspection) => {
    let full = inspection;
    if (needsFullInspection(inspection)) {
      try {
        full = (await fetchFullInspection(inspection.id)) ?? inspection;
      } catch (error) {
        console.error(error);
      }
    }
    try {
      await downloadInspectionReport({ ...full, photos: full.photos ?? [] });
    } catch (error) {
      console.error(error);
      notify.error("Error al generar el PDF");
    }
  }, []);

  return { submitInspection, removeEntry, downloadReport };
}
