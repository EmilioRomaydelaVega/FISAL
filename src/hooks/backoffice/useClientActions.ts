import { useCallback, type Dispatch } from "react";

import { buildNewClient } from "@/lib/domain/clients";
import { getErrorMessage } from "@/lib/errors";
import { notify } from "@/lib/notify";
import { clientFormSchema, firstIssue, type ClientFormValues } from "@/lib/validation";
import { deleteClient, insertClient, updateClient } from "@/services/clients.service";
import type { Client } from "@/types/domain";

import type { BackofficeAction } from "./backoffice-store";

export interface ClientActions {
  /** Crea el cliente (sin `id`) o actualiza el indicado. Devuelve `true` si se guarda. */
  saveClient: (values: ClientFormValues, editingId: string | null) => Promise<boolean>;
  toggleAccess: (client: Client) => Promise<void>;
  removeClient: (client: Client) => Promise<void>;
}

export function useClientActions(dispatch: Dispatch<BackofficeAction>): ClientActions {
  const saveClient = useCallback(
    async (values: ClientFormValues, editingId: string | null) => {
      const result = clientFormSchema.safeParse(values);
      if (!result.success) {
        notify.error(firstIssue(result.error));
        return false;
      }
      try {
        if (editingId) {
          await updateClient(editingId, result.data);
          dispatch({ type: "clientPatched", id: editingId, changes: result.data });
          notify.success("Cliente actualizado");
        } else {
          const client = buildNewClient(result.data);
          await insertClient(client);
          dispatch({
            type: "clientUpserted",
            client: { ...client, created_at: new Date().toISOString() },
          });
          notify.success(`Cliente creado · código ${client.access_code}`);
        }
        return true;
      } catch (error) {
        notify.error(getErrorMessage(error));
        return false;
      }
    },
    [dispatch],
  );

  const toggleAccess = useCallback(
    async (client: Client) => {
      const active = !client.active;
      try {
        await updateClient(client.id, { active });
      } catch {
        notify.error("No se pudo cambiar el acceso");
        return;
      }
      dispatch({ type: "clientPatched", id: client.id, changes: { active } });
      notify.success(active ? "Acceso activado" : "Acceso desactivado");
    },
    [dispatch],
  );

  const removeClient = useCallback(
    async (client: Client) => {
      try {
        await deleteClient(client.id);
      } catch {
        notify.error("No se pudo eliminar");
        return;
      }
      dispatch({ type: "clientRemoved", id: client.id });
      notify.success("Cliente eliminado");
    },
    [dispatch],
  );

  return { saveClient, toggleAccess, removeClient };
}
