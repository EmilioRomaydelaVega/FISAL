import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/csv";
import type { Damage, FleetMap, HistoryEntry, Inspection, Machine } from "@/types/domain";

import { filterDailyChecks, findMachinesMissingCheck, hasIncident } from "../daily-checks";
import {
  computeFleetStats,
  getExtinguisherStatus,
  getRentEndWarning,
  isRented,
  RELEASED_FLEET_PATCH,
} from "../fleet";
import {
  buildRental,
  computeOverallStatus,
  createDefaultChecklist,
  getTopLevelHistory,
} from "../inspections";

const NOW = new Date("2026-06-10T10:00:00Z");
const machine = (id: number): Machine => ({
  id,
  name: `M${id}`,
  serial: `S${id}`,
  category: "Excavadora",
  image: "🚜",
});
const damage = (severity: Damage["severity"]): Damage => ({
  id: severity,
  zone: "cabina",
  type: "Rotura",
  desc: "",
  severity,
});
const inspection = (id: number, machineId: number, client: string): Inspection => ({
  id,
  type: "salida",
  machine: machine(machineId),
  client,
  operator: "",
  km: "",
  fuelLevel: "3/4",
  notes: "",
  checklist: {},
  checkNotes: {},
  damages: [],
  signName: "",
  date: "",
  defectCount: 0,
  failCount: 0,
});

describe("flota", () => {
  it("considera alquilada una máquina con nombre de cliente", () => {
    expect(isRented({ client: "Acme" })).toBe(true);
    expect(isRented({ client: "  " })).toBe(false);
    expect(isRented({ clientId: "c1" })).toBe(false);
  });

  it("clasifica la revisión del extintor", () => {
    expect(getExtinguisherStatus({}, NOW)).toBeNull();
    expect(getExtinguisherStatus({ extinguisherDate: "2026-06-01" }, NOW)).toEqual({
      kind: "expired",
    });
    expect(getExtinguisherStatus({ extinguisherDate: "2026-06-20" }, NOW)).toEqual({
      kind: "soon",
      days: 10,
    });
    expect(getExtinguisherStatus({ extinguisherDate: "2026-09-01" }, NOW)?.kind).toBe("ok");
  });

  it("avisa del fin de alquiler solo en máquinas alquiladas", () => {
    const rented = { client: "Acme" };
    expect(getRentEndWarning({ rentEnd: "2026-06-01" }, NOW)).toBeNull();
    expect(getRentEndWarning({ ...rented, rentEnd: "2026-06-08" }, NOW)).toEqual({
      kind: "overdue",
      days: 2,
    });
    expect(getRentEndWarning({ ...rented, rentEnd: "2026-06-10" }, NOW)).toEqual({ kind: "today" });
    expect(getRentEndWarning({ ...rented, rentEnd: "2026-06-13" }, NOW)).toEqual({
      kind: "soon",
      days: 3,
    });
    expect(getRentEndWarning({ ...rented, rentEnd: "2026-06-30" }, NOW)).toBeNull();
  });

  it("al liberar una máquina se quita también el acceso del cliente", () => {
    expect(RELEASED_FLEET_PATCH).toMatchObject({ clientId: "", client: "", documents: [] });
  });

  it("calcula los indicadores de flota", () => {
    const fleet: FleetMap = {
      "1": { client: "Acme", extinguisherDate: "2026-06-01" },
      "2": { extinguisherDate: "2026-06-15" },
    };
    expect(computeFleetStats([machine(1), machine(2), machine(3)], fleet, NOW)).toEqual({
      rented: 1,
      available: 2,
      extinguisherSoon: 1,
      extinguisherExpired: 1,
    });
  });
});

describe("inspecciones", () => {
  it("calcula el estado global", () => {
    const checklist = createDefaultChecklist();
    expect(computeOverallStatus(checklist, [])).toBe("ok");
    expect(computeOverallStatus(checklist, [damage("leve")])).toBe("aviso");
    expect(computeOverallStatus(checklist, [damage("grave")])).toBe("grave");
    const defects = {
      ...checklist,
      motor: "defecto",
      aceite: "defecto",
      frenos: "defecto",
    } as const;
    expect(computeOverallStatus(defects, [])).toBe("grave");
  });

  it("archiva el alquiler con las inspecciones de esa máquina y cliente aún libres", () => {
    const history: HistoryEntry[] = [
      inspection(1, 8, "Acme S.L."),
      inspection(2, 8, "Otro"),
      inspection(3, 9, "Acme S.L."),
    ];
    const rental = buildRental(machine(8), { client: " acme s.l. ", rentEnd: "" }, history, NOW);
    expect(rental.relatedInspectionIds).toEqual([1]);
    expect(rental.rentEnd).toBe("2026-06-10");

    const withRental = [rental, ...history];
    const again = buildRental(machine(8), { client: "Acme S.L." }, withRental, NOW);
    expect(again.relatedInspectionIds).toEqual([]);
    expect(getTopLevelHistory(withRental).map((entry) => entry.id)).toEqual([rental.id, 2, 3]);
  });
});

describe("partes diarios", () => {
  const check = {
    clientId: "c1",
    clientName: "Acme",
    machineId: "8",
    machineName: "M8",
    machineSerial: "S8",
    date: "2026-06-10",
    createdAt: "",
    checks: {},
    hours: "",
    operator: "",
    incident: false,
    incidentDesc: "",
    hasFailures: true,
  };

  it("detecta incidencias y filtra", () => {
    expect(hasIncident(check)).toBe(true);
    expect(filterDailyChecks([check], { client: "c1", machine: "", date: "" })).toHaveLength(1);
    expect(filterDailyChecks([check], { client: "", machine: "9", date: "" })).toHaveLength(0);
  });

  it("lista las máquinas asignadas sin parte del día", () => {
    const fleet: FleetMap = { "8": { clientId: "c1" }, "9": { clientId: "c1" }, "10": {} };
    const missing = findMachinesMissingCheck(
      [machine(8), machine(9), machine(10)],
      fleet,
      [check],
      "2026-06-10",
    );
    expect(missing.map((item) => item.id)).toEqual([9]);
  });
});

describe("CSV", () => {
  it("usa ; y escapa comillas, separadores y saltos de línea", () => {
    expect(toCsv([{ A: 'di "hola"', B: "x;y", C: "l1\nl2", D: null }])).toBe(
      'A;B;C;D\n"di ""hola""";"x;y";l1 l2;',
    );
    expect(toCsv([])).toBe("");
  });
});
