import { useCallback, useEffect, useRef, type Dispatch } from "react";

import { MAX_DOCUMENT_BYTES } from "@/constants/machines";
import { RELEASED_FLEET_PATCH, getFleetEntry } from "@/lib/domain/fleet";
import { buildRental } from "@/lib/domain/inspections";
import { getErrorDetail } from "@/lib/errors";
import { notify } from "@/lib/notify";
import {
  getMachineDocumentUrl,
  removeMachineDocument,
  uploadMachineDocument,
} from "@/services/documents.service";
import { saveFleetEntry } from "@/services/fleet.service";
import { insertHistoryEntry } from "@/services/inspections.service";
import type { FleetEntry, FleetMap, HistoryEntry, Machine, MachineDocument } from "@/types/domain";

import type { BackofficeAction } from "./backoffice-store";

export interface FleetActions {
  /** Aplica cambios a la ficha y la guarda al momento. */
  updateEntry: (machineId: Machine["id"], patch: Partial<FleetEntry>) => void;
  uploadDocument: (machine: Machine, file: File) => Promise<void>;
  openDocument: (document: MachineDocument) => Promise<void>;
  removeDocument: (machine: Machine, document: MachineDocument) => Promise<void>;
  /** Archiva el alquiler en el historial y deja la máquina disponible. */
  releaseMachine: (machine: Machine) => Promise<void>;
}

export function useFleetActions(
  fleet: FleetMap,
  history: readonly HistoryEntry[],
  dispatch: Dispatch<BackofficeAction>,
): FleetActions {
  // Los cambios encadenados (p. ej. al escribir) parten siempre de la última ficha.
  const fleetRef = useRef(fleet);
  const historyRef = useRef(history);
  useEffect(() => {
    fleetRef.current = fleet;
    historyRef.current = history;
  }, [fleet, history]);

  const updateEntry = useCallback(
    (machineId: Machine["id"], patch: Partial<FleetEntry>) => {
      const key = String(machineId);
      const entry = { ...getFleetEntry(fleetRef.current, key), ...patch };
      fleetRef.current = { ...fleetRef.current, [key]: entry };
      dispatch({ type: "fleetSet", machineId: key, entry });
      saveFleetEntry(key, entry).catch((error: unknown) => {
        console.error(error);
      });
    },
    [dispatch],
  );

  const uploadDocument = useCallback(
    async (machine: Machine, file: File) => {
      if (file.size > MAX_DOCUMENT_BYTES) {
        notify.error("Máximo 20MB por archivo");
        return;
      }
      notify.info("Subiendo documento...");
      try {
        const document = await uploadMachineDocument(String(machine.id), file);
        const current = getFleetEntry(fleetRef.current, machine.id).documents ?? [];
        updateEntry(machine.id, { documents: [...current, document] });
        notify.success("Documento subido");
      } catch (error) {
        notify.error(`Error al subir: ${getErrorDetail(error)}`);
      }
    },
    [updateEntry],
  );

  const openDocument = useCallback(async (document: MachineDocument) => {
    try {
      window.open(await getMachineDocumentUrl(document.path), "_blank", "noopener");
    } catch {
      notify.error("Error al abrir documento");
    }
  }, []);

  const removeDocument = useCallback(
    async (machine: Machine, document: MachineDocument) => {
      try {
        await removeMachineDocument(document.path);
      } catch (error) {
        console.error(error);
      }
      const current = getFleetEntry(fleetRef.current, machine.id).documents ?? [];
      updateEntry(machine.id, { documents: current.filter((doc) => doc.path !== document.path) });
      notify.success("Documento eliminado");
    },
    [updateEntry],
  );

  const releaseMachine = useCallback(
    async (machine: Machine) => {
      const entry = getFleetEntry(fleetRef.current, machine.id);
      const rental = buildRental(machine, entry, historyRef.current);
      try {
        await insertHistoryEntry(rental);
      } catch (error) {
        notify.error(`Error al archivar: ${getErrorDetail(error)}`);
        return;
      }
      dispatch({ type: "historyAdded", entry: rental });
      updateEntry(machine.id, RELEASED_FLEET_PATCH);
      notify.success("Alquiler archivado en el historial");
    },
    [dispatch, updateEntry],
  );

  return { updateEntry, uploadDocument, openDocument, removeDocument, releaseMachine };
}
