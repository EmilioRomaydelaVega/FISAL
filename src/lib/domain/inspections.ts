import { INSPECTION_CHECKLIST } from "@/constants/inspection";
import { formatDateTime, localDateStamp } from "@/lib/dates";
import { createId } from "@/lib/ids";
import { normalizeText, sameId } from "@/lib/text";
import type {
  CheckStatus,
  Damage,
  EntityId,
  FleetEntry,
  HistoryEntry,
  Inspection,
  InspectionType,
  Machine,
  Photo,
  Rental,
} from "@/types/domain";

export type Checklist = Record<string, CheckStatus>;

export function createDefaultChecklist(): Checklist {
  return Object.fromEntries(INSPECTION_CHECKLIST.map((item) => [item.id, "ok" as const]));
}

export function countChecklistStatus(checklist: Checklist, status: CheckStatus): number {
  return Object.values(checklist).filter((value) => value === status).length;
}

export type OverallStatus = "ok" | "aviso" | "grave";

/** Grave si hay algún desperfecto grave o más de 2 defectos en el checklist. */
export function computeOverallStatus(
  checklist: Checklist,
  damages: readonly Damage[],
): OverallStatus {
  const defects = countChecklistStatus(checklist, "defecto");
  if (damages.length === 0 && defects === 0) return "ok";
  if (damages.some((damage) => damage.severity === "grave") || defects > 2) return "grave";
  return "aviso";
}

export function isRental(entry: HistoryEntry): entry is Rental {
  return entry.type === "alquiler";
}

export function hasIncidents(inspection: Inspection): boolean {
  return inspection.defectCount + inspection.failCount > 0;
}

export function getPhotoCount(inspection: Inspection): number {
  return inspection.photos?.length ?? inspection.photoCount ?? 0;
}

/** El listado se carga sin fotos; hace falta el documento completo para el PDF. */
export function needsFullInspection(inspection: Inspection): boolean {
  return (
    !Array.isArray(inspection.photos) ||
    ((inspection.photoCount ?? 0) > 0 && inspection.photos.length === 0)
  );
}

export interface InspectionDraftData {
  type: InspectionType;
  machine: Machine;
  client: string;
  operator: string;
  km: string;
  fuelLevel: string;
  notes: string;
  checklist: Checklist;
  checkNotes: Record<string, string>;
  photos: Photo[];
  damages: Damage[];
  signName: string;
}

export function buildInspection(data: InspectionDraftData, now: Date = new Date()): Inspection {
  return {
    id: createId.inspection(),
    type: data.type,
    machine: data.machine,
    client: data.client,
    operator: data.operator,
    km: data.km,
    fuelLevel: data.fuelLevel,
    notes: data.notes,
    checklist: { ...data.checklist },
    checkNotes: { ...data.checkNotes },
    photos: [...data.photos],
    damages: [...data.damages],
    signName: data.signName,
    date: formatDateTime(now),
    defectCount: data.damages.length,
    failCount: countChecklistStatus(data.checklist, "defecto"),
  };
}

/** Ids de inspecciones ya agrupadas dentro de algún alquiler archivado. */
export function collectAttachedInspectionIds(history: readonly HistoryEntry[]): Set<string> {
  const ids = new Set<string>();
  for (const entry of history) {
    if (isRental(entry)) entry.relatedInspectionIds.forEach((id) => ids.add(String(id)));
  }
  return ids;
}

/** Entradas del historial que se muestran sueltas (no agrupadas en un alquiler). */
export function getTopLevelHistory(history: readonly HistoryEntry[]): HistoryEntry[] {
  const attached = collectAttachedInspectionIds(history);
  return history.filter((entry) => !attached.has(String(entry.id)));
}

export function getRentalInspections(
  rental: Rental,
  history: readonly HistoryEntry[],
): Inspection[] {
  const related = new Set(rental.relatedInspectionIds.map(String));
  return history.filter(
    (entry): entry is Inspection => !isRental(entry) && related.has(String(entry.id)),
  );
}

/**
 * Crea el registro de alquiler que se archiva al liberar una máquina, con las
 * inspecciones de esa máquina y cliente que aún no pertenecen a otro alquiler.
 */
export function buildRental(
  machine: Machine,
  entry: FleetEntry,
  history: readonly HistoryEntry[],
  now: Date = new Date(),
): Rental {
  const today = localDateStamp(now);
  const client = entry.client ?? "";
  const clientKey = normalizeText(client);
  const attached = collectAttachedInspectionIds(history);
  const relatedInspectionIds: EntityId[] = history
    .filter(
      (item): item is Inspection =>
        !isRental(item) &&
        sameId(item.machine.id, machine.id) &&
        normalizeText(item.client) === clientKey &&
        !attached.has(String(item.id)),
    )
    .map((item) => item.id);

  return {
    id: createId.rental(),
    type: "alquiler",
    machine: { id: machine.id, name: machine.name, image: machine.image },
    client,
    location: entry.location ?? "",
    rentStart: entry.rentStart ?? "",
    rentEnd: entry.rentEnd || today,
    releasedAt: today,
    date: today,
    notes: entry.notes ?? "",
    documents: entry.documents ?? [],
    relatedInspectionIds,
    // Campos de compatibilidad con los registros de inspección.
    operator: "—",
    fuelLevel: "—",
    km: "",
    photos: [],
    failCount: 0,
    defectCount: 0,
    signName: client,
  };
}
