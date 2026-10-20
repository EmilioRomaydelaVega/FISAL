import { toast } from "sonner";

const DURATION_MS = 3000;
const ACTION_DURATION_MS = 10000;

/** Avisos flotantes de la aplicación. */
export const notify = {
  success(message: string): void {
    toast.success(message, { duration: DURATION_MS });
  },
  error(message: string): void {
    toast.error(message, { duration: DURATION_MS });
  },
  info(message: string): void {
    toast(message, { duration: DURATION_MS });
  },
  /** Aviso con un botón de acción; dura más para dar tiempo a pulsarlo. */
  withAction(message: string, action: { label: string; onClick: () => void }): void {
    toast.success(message, { duration: ACTION_DURATION_MS, action });
  },
};
