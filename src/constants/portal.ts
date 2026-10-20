import type { PortalCheckStatus } from "@/types/domain";

export interface PortalChecklistItem {
  id: string;
  label: string;
  icon: string;
}

/** Checklist rápido del parte diario que rellena el cliente. */
export const PORTAL_CHECKLIST: readonly PortalChecklistItem[] = [
  { id: "niveles", label: "Niveles (aceite / refrigerante)", icon: "🛢️" },
  { id: "fugas", label: "Fugas", icon: "💧" },
  { id: "luces", label: "Luces y señalización", icon: "💡" },
  { id: "rodadura", label: "Neumáticos / Orugas", icon: "🛞" },
  { id: "cazo_caja", label: "Cazo / Caja de carga", icon: "🪣" },
  { id: "escalera", label: "Escalera / Peldaños", icon: "🪜" },
  { id: "seguridad", label: "Seguridad (extintor, cinturón)", icon: "🧯" },
];

export const PORTAL_CHECK_STATUS_LABELS: Record<PortalCheckStatus, string> = {
  ok: "OK",
  atencion: "Atención",
  fallo: "Fallo",
};

/** Fotos por selección y en total en un parte diario. */
export const PORTAL_PHOTOS_PER_PICK = 6;
export const PORTAL_MAX_PHOTOS = 8;
export const PORTAL_PHOTO_OPTIONS = { maxSize: 1280, quality: 0.6 } as const;

/** Partes anteriores mostrados bajo el formulario. */
export const PORTAL_HISTORY_LIMIT = 15;

/** Espera antes de volver al listado tras enviar el parte. */
export const PORTAL_REDIRECT_DELAY_MS = 1200;
