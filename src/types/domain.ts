/**
 * Modelo de dominio de la aplicación.
 *
 * Las columnas `data` / `summary` de Supabase son JSON libre, así que cada
 * documento se valida con Zod al leerlo. Los esquemas son tolerantes (valores
 * por defecto en lugar de errores) para seguir leyendo los registros antiguos
 * creados por la versión original.
 */
import { z } from "zod";

import type { Tables } from "./database";

/** Los ids de máquinas e inspecciones son numéricos en datos antiguos y texto en otros. */
export const entityIdSchema = z.union([z.string(), z.number()]);
export type EntityId = z.infer<typeof entityIdSchema>;

const text = z.string().catch("");

/* --------------------------------------------------------------- máquinas */

export const machineSchema = z.looseObject({
  id: entityIdSchema,
  name: z.string().catch("Máquina"),
  serial: text,
  category: text,
  image: z.string().catch("🚜"),
});
export type Machine = z.infer<typeof machineSchema>;

/* ------------------------------------------------------------------ flota */

export const machineDocumentSchema = z.object({
  name: z.string(),
  path: z.string(),
  uploadedAt: z.string().optional(),
  size: z.number().optional(),
});
export type MachineDocument = z.infer<typeof machineDocumentSchema>;

/** Ficha de alquiler de una máquina (tabla `fleet`). Se conservan las claves desconocidas. */
export const fleetEntrySchema = z.looseObject({
  clientId: z.string().optional(),
  client: z.string().optional(),
  location: z.string().optional(),
  rentStart: z.string().optional(),
  rentEnd: z.string().optional(),
  hasExtinguisher: z.boolean().optional(),
  extinguisherDate: z.string().optional(),
  notes: z.string().optional(),
  documents: z.array(machineDocumentSchema).optional(),
});
export type FleetEntry = z.infer<typeof fleetEntrySchema>;

/** Fichas de flota indexadas por id de máquina (como texto). */
export type FleetMap = Record<string, FleetEntry>;

/* ----------------------------------------------------------- inspecciones */

export const INSPECTION_TYPES = ["salida", "entrada"] as const;
export type InspectionType = (typeof INSPECTION_TYPES)[number];

export const CHECK_STATUSES = ["ok", "defecto", "n/a"] as const;
export const checkStatusSchema = z.enum(CHECK_STATUSES);
export type CheckStatus = z.infer<typeof checkStatusSchema>;

export const DAMAGE_SEVERITIES = ["leve", "moderado", "grave"] as const;
export const damageSeveritySchema = z.enum(DAMAGE_SEVERITIES);
export type DamageSeverity = z.infer<typeof damageSeveritySchema>;

export const FUEL_LEVELS = ["Vacío", "1/4", "1/2", "3/4", "Lleno"] as const;
export const DEFAULT_FUEL_LEVEL = "3/4";

export const photoSchema = z.object({
  id: entityIdSchema,
  src: z.string(),
  name: text,
  size: text,
  ts: text,
});
export type Photo = z.infer<typeof photoSchema>;

export const damageSchema = z.object({
  id: entityIdSchema,
  zone: z.string(),
  type: text,
  desc: text,
  severity: damageSeveritySchema.catch("leve"),
});
export type Damage = z.infer<typeof damageSchema>;

export const inspectionSchema = z.looseObject({
  id: entityIdSchema,
  type: z.enum(INSPECTION_TYPES),
  machine: machineSchema,
  client: text,
  operator: text,
  km: text,
  fuelLevel: text,
  notes: text,
  checklist: z.record(z.string(), checkStatusSchema.catch("ok")).catch({}),
  checkNotes: z.record(z.string(), z.string()).catch({}),
  /** Ausente en los listados: `summary` guarda el recuento en `photoCount`. */
  photos: z.array(photoSchema).optional(),
  photoCount: z.number().optional(),
  damages: z.array(damageSchema).catch([]),
  signName: text,
  date: text,
  defectCount: z.number().catch(0),
  failCount: z.number().catch(0),
});
export type Inspection = z.infer<typeof inspectionSchema>;

/** Alquiler archivado al liberar una máquina; se guarda en la tabla `inspections`. */
export const rentalSchema = z.looseObject({
  id: entityIdSchema,
  type: z.literal("alquiler"),
  machine: z.looseObject({
    id: entityIdSchema,
    name: z.string().catch("Máquina"),
    image: z.string().catch("🚜"),
    serial: z.string().optional(),
  }),
  client: text,
  location: text,
  rentStart: text,
  rentEnd: text,
  releasedAt: text,
  date: text,
  notes: text,
  documents: z.array(machineDocumentSchema).catch([]),
  relatedInspectionIds: z.array(entityIdSchema).catch([]),
});
export type Rental = z.infer<typeof rentalSchema>;

export const historyEntrySchema = z.discriminatedUnion("type", [inspectionSchema, rentalSchema]);
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

/* ----------------------------------------------------------- partes diarios */

export const PORTAL_CHECK_STATUSES = ["ok", "atencion", "fallo"] as const;
export const portalCheckStatusSchema = z.enum(PORTAL_CHECK_STATUSES);
export type PortalCheckStatus = z.infer<typeof portalCheckStatusSchema>;

export const dailyCheckSchema = z.looseObject({
  id: z.string().optional(),
  clientId: text,
  clientName: text,
  machineId: z.coerce.string(),
  machineName: text,
  machineSerial: text,
  date: z.string(),
  createdAt: text,
  checks: z.record(z.string(), portalCheckStatusSchema.catch("ok")).catch({}),
  hours: text,
  operator: text,
  incident: z.boolean().catch(false),
  incidentDesc: text,
  hasFailures: z.boolean().catch(false),
  /** Solo en `data`; `summary` los sustituye por `photoCount`. */
  signature: z.string().nullable().optional(),
  photos: z.array(z.string()).optional(),
  photoCount: z.number().optional(),
});
export type DailyCheck = z.infer<typeof dailyCheckSchema>;

/* ---------------------------------------------------------------- clientes */

export type Client = Tables<"clients">;

export const clientSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});
export type ClientSession = z.infer<typeof clientSessionSchema>;
