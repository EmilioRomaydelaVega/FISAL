import { EXTINGUISHER_WARNING_DAYS, RENT_END_WARNING_DAYS } from "@/constants/machines";
import { calendarDaysUntil, daysUntil } from "@/lib/dates";
import type { FleetEntry, FleetMap, Machine } from "@/types/domain";

export type FleetFilter = "all" | "rented" | "available";

export function getFleetEntry(fleet: FleetMap, machineId: Machine["id"]): FleetEntry {
  return fleet[String(machineId)] ?? {};
}

/** Una máquina está alquilada cuando su ficha tiene nombre de cliente. */
export function isRented(entry: FleetEntry): boolean {
  return Boolean(entry.client?.trim());
}

export type ExtinguisherStatus =
  { kind: "expired" } | { kind: "soon"; days: number } | { kind: "ok"; days: number };

export function getExtinguisherStatus(
  entry: FleetEntry,
  now: Date = new Date(),
): ExtinguisherStatus | null {
  if (!entry.extinguisherDate) return null;
  const diff = daysUntil(entry.extinguisherDate, now);
  if (diff < 0) return { kind: "expired" };
  const days = Math.ceil(diff);
  return diff < EXTINGUISHER_WARNING_DAYS ? { kind: "soon", days } : { kind: "ok", days };
}

export type RentEndWarning =
  { kind: "overdue"; days: number } | { kind: "today" } | { kind: "soon"; days: number };

/** Aviso de fin de alquiler: vencido, hoy o en los próximos días. */
export function getRentEndWarning(
  entry: FleetEntry,
  now: Date = new Date(),
): RentEndWarning | null {
  if (!isRented(entry) || !entry.rentEnd) return null;
  const days = calendarDaysUntil(entry.rentEnd, now);
  if (days < 0) return { kind: "overdue", days: Math.abs(days) };
  if (days === 0) return { kind: "today" };
  if (days <= RENT_END_WARNING_DAYS) return { kind: "soon", days };
  return null;
}

export interface FleetStats {
  rented: number;
  available: number;
  extinguisherSoon: number;
  extinguisherExpired: number;
}

export function computeFleetStats(
  machines: readonly Machine[],
  fleet: FleetMap,
  now: Date = new Date(),
): FleetStats {
  const stats: FleetStats = {
    rented: 0,
    available: 0,
    extinguisherSoon: 0,
    extinguisherExpired: 0,
  };
  for (const machine of machines) {
    const entry = getFleetEntry(fleet, machine.id);
    if (isRented(entry)) stats.rented++;
    else stats.available++;
    const extinguisher = getExtinguisherStatus(entry, now);
    if (extinguisher?.kind === "expired") stats.extinguisherExpired++;
    else if (extinguisher?.kind === "soon") stats.extinguisherSoon++;
  }
  return stats;
}

export function filterFleet(
  machines: readonly Machine[],
  fleet: FleetMap,
  filter: FleetFilter,
): Machine[] {
  if (filter === "all") return [...machines];
  return machines.filter((machine) => {
    const rented = isRented(getFleetEntry(fleet, machine.id));
    return filter === "rented" ? rented : !rented;
  });
}

/** Máquinas asignadas a un cliente del portal. */
export function machinesOfClient(
  machines: readonly Machine[],
  fleet: FleetMap,
  clientId: string,
): Machine[] {
  return machines.filter((machine) => getFleetEntry(fleet, machine.id).clientId === clientId);
}

/** Campos que se vacían al liberar una máquina; el cliente deja de verla en su portal. */
export const RELEASED_FLEET_PATCH: Partial<FleetEntry> = {
  clientId: "",
  client: "",
  location: "",
  rentStart: "",
  rentEnd: "",
  notes: "",
  documents: [],
};
