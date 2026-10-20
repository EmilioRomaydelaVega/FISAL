/** Columnas de las exportaciones CSV/PDF de cada listado. */
import type { ExportRow } from "@/lib/csv";
import type { Client, DailyCheck, FleetMap, HistoryEntry, Machine } from "@/types/domain";

import { hasIncident } from "./daily-checks";
import { getFleetEntry, isRented } from "./fleet";
import { isRental } from "./inspections";

const yesNo = (value: boolean) => (value ? "Si" : "No");

export function machineExportRows(machines: readonly Machine[]): ExportRow[] {
  return machines.map((machine) => ({
    Nombre: machine.name,
    Serie: machine.serial,
    Categoria: machine.category,
    Icono: machine.image,
  }));
}

export function fleetExportRows(machines: readonly Machine[], fleet: FleetMap): ExportRow[] {
  return machines.map((machine) => {
    const entry = getFleetEntry(fleet, machine.id);
    return {
      Maquina: machine.name,
      Serie: machine.serial,
      Categoria: machine.category,
      Estado: isRented(entry) ? "Alquilada" : "Disponible",
      Cliente: entry.client ?? "",
      Ubicacion: entry.location ?? "",
      InicioAlquiler: entry.rentStart ?? "",
      FinAlquiler: entry.rentEnd ?? "",
      Extintor: entry.extinguisherDate ?? "",
    };
  });
}

export function clientCsvRows(clients: readonly Client[]): ExportRow[] {
  return clients.map((client) => ({
    Cliente: client.name,
    CIF: client.cif ?? "",
    Contacto: client.contact ?? "",
    Telefono: client.phone ?? "",
    Email: client.email ?? "",
    Obra: client.site ?? "",
    Codigo: client.access_code,
    Activo: yesNo(client.active),
  }));
}

export function clientPdfRows(clients: readonly Client[]): ExportRow[] {
  return clients.map((client) => ({
    Cliente: client.name,
    Contacto: client.contact ?? "",
    Telefono: client.phone ?? "",
    Codigo: client.access_code,
    Activo: yesNo(client.active),
  }));
}

export function dailyCheckExportRows(checks: readonly DailyCheck[]): ExportRow[] {
  return checks.map((check) => ({
    Fecha: check.date,
    Cliente: check.clientName,
    Maquina: check.machineName,
    Serie: check.machineSerial,
    Operador: check.operator,
    Horas: check.hours,
    Estado: hasIncident(check) ? "Con incidencia" : "Correcto",
    Incidencia: check.incidentDesc,
    Fotos: check.photoCount ?? 0,
  }));
}

export function historyExportRows(history: readonly HistoryEntry[]): ExportRow[] {
  return history.map((entry) => {
    const rental = isRental(entry) ? entry : null;
    return {
      ID: entry.id,
      Fecha: entry.date,
      Tipo: entry.type,
      Maquina: entry.machine.name,
      Serie: entry.machine.serial ?? "",
      Cliente: entry.client,
      Ubicacion: rental?.location ?? "",
      InicioAlquiler: rental?.rentStart ?? "",
      FinAlquiler: rental?.rentEnd ?? "",
      Notas: entry.notes,
    };
  });
}
