import { z } from "zod";

import { INSPECTION_STEPS } from "@/constants/inspection";
import { createDefaultChecklist, type Checklist } from "@/lib/domain/inspections";
import {
  checkStatusSchema,
  damageSchema,
  DEFAULT_FUEL_LEVEL,
  INSPECTION_TYPES,
  machineSchema,
  photoSchema,
  type CheckStatus,
  type Damage,
  type InspectionType,
  type Machine,
  type Photo,
} from "@/types/domain";

/** Estado del asistente de inspección. */
export interface InspectionFormState {
  step: number;
  type: InspectionType | null;
  machine: Machine | null;
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

export type TextField = "client" | "operator" | "km" | "fuelLevel" | "notes" | "signName";

export const LAST_STEP = INSPECTION_STEPS.length - 1;

export function createInitialForm(): InspectionFormState {
  return {
    step: 0,
    type: null,
    machine: null,
    client: "",
    operator: "",
    km: "",
    fuelLevel: DEFAULT_FUEL_LEVEL,
    notes: "",
    checklist: createDefaultChecklist(),
    checkNotes: {},
    photos: [],
    damages: [],
    signName: "",
  };
}

export type InspectionFormAction =
  | { type: "reset" }
  | { type: "restore"; state: InspectionFormState }
  | { type: "setType"; value: InspectionType | null }
  | { type: "setStep"; step: number }
  | { type: "setMachine"; machine: Machine }
  | { type: "setText"; field: TextField; value: string }
  | { type: "setCheck"; itemId: string; status: CheckStatus }
  | { type: "setCheckNote"; itemId: string; note: string }
  | { type: "addPhoto"; photo: Photo }
  | { type: "removePhoto"; id: Photo["id"] }
  | { type: "addDamage"; damage: Damage }
  | { type: "removeDamage"; id: Damage["id"] };

export function inspectionFormReducer(
  state: InspectionFormState,
  action: InspectionFormAction,
): InspectionFormState {
  switch (action.type) {
    case "reset":
      return createInitialForm();
    case "restore":
      return action.state;
    case "setType":
      return { ...state, type: action.value };
    case "setStep":
      return { ...state, step: Math.min(Math.max(action.step, 0), LAST_STEP) };
    case "setMachine":
      return { ...state, machine: action.machine };
    case "setText":
      return { ...state, [action.field]: action.value };
    case "setCheck":
      return { ...state, checklist: { ...state.checklist, [action.itemId]: action.status } };
    case "setCheckNote":
      return { ...state, checkNotes: { ...state.checkNotes, [action.itemId]: action.note } };
    case "addPhoto":
      return { ...state, photos: [...state.photos, action.photo] };
    case "removePhoto":
      return { ...state, photos: state.photos.filter((photo) => photo.id !== action.id) };
    case "addDamage":
      return { ...state, damages: [...state.damages, action.damage] };
    case "removeDamage":
      return { ...state, damages: state.damages.filter((damage) => damage.id !== action.id) };
  }
}

/* --------------------------------------------------------------- borrador */

/** Formato del borrador guardado (mismas claves que la versión original). */
const draftSchema = z.object({
  step: z.number().catch(0),
  inspType: z.enum(INSPECTION_TYPES),
  selectedMachine: machineSchema.nullable().catch(null),
  client: z.string().catch(""),
  operator: z.string().catch(""),
  km: z.string().catch(""),
  fuelLevel: z.string().catch(DEFAULT_FUEL_LEVEL),
  notes: z.string().catch(""),
  checklist: z.record(z.string(), checkStatusSchema).catch({}),
  checkNotes: z.record(z.string(), z.string()).catch({}),
  photos: z.array(photoSchema).catch([]),
  damages: z.array(damageSchema).catch([]),
  signName: z.string().catch(""),
});
type Draft = z.infer<typeof draftSchema>;

export function toDraft(state: InspectionFormState & { type: InspectionType }): Draft {
  return {
    step: state.step,
    inspType: state.type,
    selectedMachine: state.machine,
    client: state.client,
    operator: state.operator,
    km: state.km,
    fuelLevel: state.fuelLevel,
    notes: state.notes,
    checklist: state.checklist,
    checkNotes: state.checkNotes,
    photos: state.photos,
    damages: state.damages,
    signName: state.signName,
  };
}

/** Convierte un borrador guardado en estado del formulario, o `null` si no hay ninguno válido. */
export function fromDraft(value: unknown): InspectionFormState | null {
  const result = draftSchema.safeParse(value);
  if (!result.success) return null;
  const draft = result.data;
  return {
    ...createInitialForm(),
    step: Math.min(Math.max(draft.step, 0), LAST_STEP),
    type: draft.inspType,
    machine: draft.selectedMachine,
    client: draft.client,
    operator: draft.operator,
    km: draft.km,
    fuelLevel: draft.fuelLevel || DEFAULT_FUEL_LEVEL,
    notes: draft.notes,
    checklist: { ...createDefaultChecklist(), ...draft.checklist },
    checkNotes: draft.checkNotes,
    photos: draft.photos,
    damages: draft.damages,
    signName: draft.signName,
  };
}
