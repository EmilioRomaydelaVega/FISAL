/**
 * Esquemas de validación de los formularios. Los mensajes son los que ve el
 * usuario cuando un campo obligatorio falta.
 */
import { z } from "zod";

import { DEFAULT_MACHINE_ICON } from "@/constants/machines";
import { DAMAGE_SEVERITIES } from "@/types/domain";

/** Primer mensaje de error de una validación fallida. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisa los datos del formulario";
}

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Indica el nombre del cliente"),
  cif: z.string(),
  contact: z.string(),
  phone: z.string(),
  email: z.string(),
  site: z.string(),
});
export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const EMPTY_CLIENT_FORM: ClientFormValues = {
  name: "",
  cif: "",
  contact: "",
  phone: "",
  email: "",
  site: "",
};

const MACHINE_REQUIRED = "Completa nombre, serie y categoría";

export const machineFormSchema = z.object({
  name: z.string().trim().min(1, MACHINE_REQUIRED),
  serial: z.string().trim().min(1, MACHINE_REQUIRED),
  category: z.string().trim().min(1, MACHINE_REQUIRED),
  image: z.string(),
});
export type MachineFormValues = z.infer<typeof machineFormSchema>;

export const EMPTY_MACHINE_FORM: MachineFormValues = {
  name: "",
  serial: "",
  category: "",
  image: DEFAULT_MACHINE_ICON,
};

/** Paso "Datos" de la inspección: máquina, cliente y operario son obligatorios. */
export const inspectionDataSchema = z.object({
  machine: z.object({ id: z.union([z.string(), z.number()]) }, "Completa los campos obligatorios"),
  client: z.string().min(1, "Completa los campos obligatorios"),
  operator: z.string().min(1, "Completa los campos obligatorios"),
});

export const signatureSchema = z.string().trim().min(1, "Introduce el nombre para la firma");

export const damageFormSchema = z.object({
  type: z.string(),
  desc: z.string(),
  severity: z.enum(DAMAGE_SEVERITIES),
});
export type DamageFormValues = z.infer<typeof damageFormSchema>;

export const EMPTY_DAMAGE_FORM: DamageFormValues = { type: "Arañazo", desc: "", severity: "leve" };

export const accessCodeSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(z.string().min(1));

export const dailyCheckFormSchema = z
  .object({
    operator: z.string().trim().min(1, "Indica el nombre del operador"),
    incident: z.boolean(),
    incidentDesc: z.string(),
  })
  .refine((form) => !form.incident || form.incidentDesc.trim().length > 0, {
    message: "Describe la incidencia",
  });
