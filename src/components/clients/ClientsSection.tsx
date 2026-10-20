import { Users } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/shared/ExportButtons";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import type { ClientActions } from "@/hooks/backoffice/useClientActions";
import { utcDateStamp } from "@/lib/dates";
import { clientCsvRows, clientPdfRows } from "@/lib/domain/exports";
import { machinesOfClient } from "@/lib/domain/fleet";
import { EMPTY_CLIENT_FORM, type ClientFormValues } from "@/lib/validation";
import type { Client, FleetMap, Machine } from "@/types/domain";

import { ClientCard } from "./ClientCard";
import { ClientForm } from "./ClientForm";

interface ClientsSectionProps {
  clients: readonly Client[];
  machines: readonly Machine[];
  fleet: FleetMap;
  actions: ClientActions;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

function toFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    cif: client.cif ?? "",
    contact: client.contact ?? "",
    phone: client.phone ?? "",
    email: client.email ?? "",
    site: client.site ?? "",
  };
}

export function ClientsSection({
  clients,
  machines,
  fleet,
  actions,
  confirm,
}: ClientsSectionProps) {
  const [form, setForm] = useState<ClientFormValues>(EMPTY_CLIENT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_CLIENT_FORM);
  };

  const save = async () => {
    if (await actions.saveClient(form, editingId)) resetForm();
  };

  const startEditing = (client: Client) => {
    setEditingId(client.id);
    setForm(toFormValues(client));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (client: Client) => {
    const confirmed = await confirm({
      title: `¿Eliminar el cliente ${client.name}?`,
      confirmLabel: "Eliminar",
    });
    if (confirmed) await actions.removeClient(client);
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Fichas de cliente y código de acceso al portal del parte diario"
        actions={
          <ExportButtons
            title="Listado de Clientes"
            fileName={`clientes_${utcDateStamp()}`}
            csvRows={() => clientCsvRows(clients)}
            pdfRows={() => clientPdfRows(clients)}
          />
        }
      />

      <ClientForm
        values={form}
        editing={editingId !== null}
        onChange={setForm}
        onSubmit={() => void save()}
        onCancel={resetForm}
      />

      {clients.length === 0 ? (
        <EmptyState icon={<Users />} title="Todavía no hay clientes dados de alta." />
      ) : (
        <ul className="grid gap-3">
          {clients.map((client) => (
            <li key={client.id}>
              <ClientCard
                client={client}
                machineCount={machinesOfClient(machines, fleet, client.id).length}
                onEdit={() => {
                  startEditing(client);
                }}
                onToggleAccess={() => void actions.toggleAccess(client)}
                onRemove={() => void remove(client)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
