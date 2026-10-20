import { useState } from "react";

import { accessCodeSchema } from "@/lib/validation";
import { clientSessionStore } from "@/services/client-session.service";
import { findClientByAccessCode } from "@/services/clients.service";

export interface ClientLogin {
  code: string;
  setCode: (code: string) => void;
  error: string;
  loading: boolean;
  /** Comprueba el código y guarda la sesión. Devuelve `true` si el acceso es válido. */
  login: () => Promise<boolean>;
}

export function useClientLogin(): ClientLogin {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const parsed = accessCodeSchema.safeParse(code);
    if (!parsed.success) return false;

    setLoading(true);
    setError("");
    try {
      const client = await findClientByAccessCode(parsed.data);
      if (!client) {
        setError("Código no válido. Revísalo con FISALRENT.");
        return false;
      }
      if (!client.active) {
        setError("Este acceso está desactivado. Contacta con FISALRENT.");
        return false;
      }
      clientSessionStore.set({ id: client.id, name: client.name, code: client.access_code });
      return true;
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { code, setCode, error, loading, login };
}
