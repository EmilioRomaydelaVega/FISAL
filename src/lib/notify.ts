import { toast } from "sonner";

const DURATION_MS = 3000;

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
};
