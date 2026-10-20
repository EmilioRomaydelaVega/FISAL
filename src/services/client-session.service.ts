import { clientSessionSchema, type ClientSession } from "@/types/domain";

const STORAGE_KEY = "fisalrent_client_session";

/** Sesión del portal de cliente guardada en el navegador. */
export const clientSessionStore = {
  get(): ClientSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const result = clientSessionSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  },
  set(session: ClientSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
