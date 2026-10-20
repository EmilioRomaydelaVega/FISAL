import { createId } from "@/lib/ids";
import { sameId } from "@/lib/text";
import type {
  ClientSession,
  DailyCheck,
  FleetMap,
  Machine,
  PortalCheckStatus,
} from "@/types/domain";

import { getFleetEntry } from "./fleet";

export interface DailyCheckFilters {
  client: string;
  machine: string;
  date: string;
}

export const EMPTY_DAILY_CHECK_FILTERS: DailyCheckFilters = { client: "", machine: "", date: "" };

export function hasIncident(check: Pick<DailyCheck, "incident" | "hasFailures">): boolean {
  return check.incident || check.hasFailures;
}

export function filterDailyChecks(
  checks: readonly DailyCheck[],
  filters: DailyCheckFilters,
): DailyCheck[] {
  return checks.filter(
    (check) =>
      (!filters.client || check.clientId === filters.client) &&
      (!filters.machine || check.machineId === filters.machine) &&
      (!filters.date || check.date === filters.date),
  );
}

/** Máquinas asignadas a un cliente que todavía no tienen el parte de `today`. */
export function findMachinesMissingCheck(
  machines: readonly Machine[],
  fleet: FleetMap,
  checks: readonly DailyCheck[],
  today: string,
): Machine[] {
  return machines.filter(
    (machine) =>
      Boolean(getFleetEntry(fleet, machine.id).clientId) &&
      !checks.some((check) => sameId(check.machineId, machine.id) && check.date === today),
  );
}

/** Puntos del checklist que no están OK. */
export function getFlaggedChecks(check: DailyCheck): [string, PortalCheckStatus][] {
  return Object.entries(check.checks).filter(([, status]) => status !== "ok");
}

export function isSameDailyCheck(a: DailyCheck, b: DailyCheck): boolean {
  if (b.id) return a.id === b.id;
  return a.machineId === b.machineId && a.date === b.date;
}

export interface DailyCheckFormData {
  checks: Record<string, PortalCheckStatus>;
  hours: string;
  operator: string;
  incident: boolean;
  incidentDesc: string;
  signature: string | null;
  photos: string[];
}

export function buildDailyCheck(
  session: ClientSession,
  machineId: string,
  machine: Machine | null,
  form: DailyCheckFormData,
  date: string,
  now: Date = new Date(),
): DailyCheck {
  return {
    id: createId.dailyCheck(machineId, date),
    clientId: session.id,
    clientName: session.name,
    machineId,
    machineName: machine?.name ?? machineId,
    machineSerial: machine?.serial ?? "",
    date,
    createdAt: now.toISOString(),
    checks: form.checks,
    hours: form.hours,
    operator: form.operator,
    incident: form.incident,
    incidentDesc: form.incidentDesc,
    signature: form.signature,
    photos: form.photos,
    hasFailures: Object.values(form.checks).some((status) => status !== "ok"),
  };
}

/** Resumen sin fotos ni firma, igual al que genera la base de datos en `summary`. */
export function toDailyCheckSummary(check: DailyCheck): DailyCheck {
  const { photos, signature: _signature, ...summary } = check;
  return { ...summary, photoCount: photos?.length ?? 0 };
}
