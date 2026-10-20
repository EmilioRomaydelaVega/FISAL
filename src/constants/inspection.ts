import type { CheckStatus, DamageSeverity, InspectionType } from "@/types/domain";

export interface ChecklistItem {
  id: string;
  label: string;
  icon: string;
  group: string;
}

/** Checklist técnico de las inspecciones de salida y entrada. */
export const INSPECTION_CHECKLIST: readonly ChecklistItem[] = [
  { id: "motor", label: "Motor / Arranque", icon: "⚙️", group: "Motor" },
  { id: "aceite", label: "Nivel de aceite", icon: "🛢️", group: "Motor" },
  { id: "refrigerante", label: "Nivel refrigerante", icon: "🌡️", group: "Motor" },
  { id: "hidraulico", label: "Sistema hidráulico", icon: "🔩", group: "Hidráulica" },
  { id: "mangueras", label: "Mangueras / Fugas", icon: "💧", group: "Hidráulica" },
  { id: "neumaticos", label: "Neumáticos", icon: "🛞", group: "Ruedas" },
  { id: "orugas", label: "Orugas", icon: "⛓️", group: "Orugas" },
  { id: "frenos", label: "Frenos", icon: "🛑", group: "Rodadura" },
  { id: "luces", label: "Luces y señalización", icon: "💡", group: "Eléctrico" },
  { id: "bateria", label: "Batería", icon: "🔋", group: "Eléctrico" },
  { id: "cabina", label: "Cabina / Asiento", icon: "🪑", group: "Cabina" },
  { id: "cinturon", label: "Cinturón de seguridad", icon: "🔐", group: "Cabina" },
  { id: "extint", label: "Extintor", icon: "🧯", group: "Seguridad" },
  { id: "cazo", label: "Cazo", icon: "🪣", group: "Cazo" },
  { id: "cazo_dientes", label: "Dientes del cazo", icon: "🦷", group: "Cazo" },
  { id: "cazo_bulones", label: "Bulones / Pasadores del cazo", icon: "🔗", group: "Cazo" },
  { id: "caja_carga", label: "Caja de carga", icon: "🗜️", group: "Caja" },
  { id: "caja_desgaste", label: "Desgaste de caja", icon: "🔩", group: "Caja" },
  { id: "caja_fugas", label: "Fugas / Grietas en caja", icon: "💧", group: "Caja" },
  { id: "escalera", label: "Escalera / Peldaños", icon: "🪜", group: "Escalera" },
  { id: "escalera_barandilla", label: "Barandilla / Pasamanos", icon: "🛡️", group: "Escalera" },
  { id: "docs", label: "Documentación / Manual", icon: "📋", group: "Documentación" },
];

/** Grupos del checklist en el orden en que aparecen. */
export const INSPECTION_CHECKLIST_GROUPS: readonly string[] = [
  ...new Set(INSPECTION_CHECKLIST.map((item) => item.group)),
];

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  ok: "OK",
  defecto: "Defecto",
  "n/a": "N/A",
};

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  salida: "Salida",
  entrada: "Entrada",
};

export const INSPECTION_STEPS = [
  "Datos",
  "Checklist",
  "Fotos",
  "Desperfectos",
  "Firma & Envío",
] as const;

export interface DamageZone {
  id: string;
  label: string;
  /** Posición en el diagrama, en porcentaje. */
  x: number;
  y: number;
}

export const DAMAGE_ZONES: readonly DamageZone[] = [
  { id: "frontal", label: "Frontal", x: 42, y: 10 },
  { id: "trasera", label: "Trasera", x: 42, y: 75 },
  { id: "lateral_izq", label: "Lateral Izq.", x: 5, y: 42 },
  { id: "lateral_der", label: "Lateral Der.", x: 79, y: 42 },
  { id: "superior", label: "Superior", x: 42, y: 42 },
  { id: "cabina", label: "Cabina", x: 25, y: 28 },
  { id: "brazo", label: "Brazo/Pluma", x: 65, y: 28 },
  { id: "tren_rod", label: "Tren rodaje", x: 42, y: 62 },
];

export const DAMAGE_TYPES = [
  "Arañazo",
  "Abolladura",
  "Rotura",
  "Corrosión",
  "Deformación",
  "Otro",
] as const;

export const DAMAGE_SEVERITY_LABELS: Record<DamageSeverity, string> = {
  leve: "Leve",
  moderado: "Moderado",
  grave: "Grave",
};

/** Fotos máximas en lado mayor y calidad JPEG de las inspecciones. */
export const INSPECTION_PHOTO_OPTIONS = { maxSize: 1024, quality: 0.6 } as const;
