import { Save, Unlock } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import type { FleetActions } from "@/hooks/backoffice/useFleetActions";
import { notify } from "@/lib/notify";
import type { Client, FleetEntry, Machine } from "@/types/domain";

import { MachineDocuments } from "./MachineDocuments";

interface FleetMachineEditorProps {
  machine: Machine;
  entry: FleetEntry;
  clients: readonly Client[];
  actions: FleetActions;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  onClose: () => void;
}

function clientHint(entry: FleetEntry): string {
  if (entry.clientId) return "Este cliente verá la máquina en su portal de parte diario.";
  if (entry.client) {
    return `Cliente actual sin ficha: ${entry.client}. Selecciónalo de la lista para darle acceso al portal.`;
  }
  return "Da de alta el cliente en la sección Clientes para poder asignarlo.";
}

export function FleetMachineEditor({
  machine,
  entry,
  clients,
  actions,
  confirm,
  onClose,
}: FleetMachineEditorProps) {
  const update = (patch: Partial<FleetEntry>) => {
    actions.updateEntry(machine.id, patch);
  };

  const release = async () => {
    if (!entry.client) {
      notify.error("Sin cliente asignado · nada que archivar");
      return;
    }
    const confirmed = await confirm({
      title: "¿Liberar la máquina?",
      description: "El alquiler se archivará en el historial y la máquina quedará disponible.",
      confirmLabel: "Liberar máquina",
      tone: "primary",
    });
    if (confirmed) await actions.releaseMachine(machine);
  };

  const removeDocument = async (document: Parameters<FleetActions["removeDocument"]>[1]) => {
    const confirmed = await confirm({
      title: "¿Eliminar este documento?",
      description: document.name,
      confirmLabel: "Eliminar",
    });
    if (confirmed) await actions.removeDocument(machine, document);
  };

  return (
    <div className="grid grid-cols-1 gap-4 border-t border-border bg-surface-muted/60 p-4 sm:grid-cols-2 sm:p-5">
      <Field label="Cliente que la tiene" hint={clientHint(entry)} className="sm:col-span-2">
        {(id) => (
          <Select
            id={id}
            value={entry.clientId ?? ""}
            onChange={(event) => {
              const client = clients.find((item) => item.id === event.target.value);
              update({ clientId: client?.id ?? "", client: client?.name ?? "" });
            }}
          >
            <option value="">— Sin cliente (disponible) —</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Ubicación / Obra" className="sm:col-span-2">
        {(id) => (
          <Input
            id={id}
            placeholder="Dirección, obra o zona"
            value={entry.location ?? ""}
            onChange={(event) => {
              update({ location: event.target.value });
            }}
          />
        )}
      </Field>

      <Field label="Fecha inicio alquiler">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={entry.rentStart ?? ""}
            onChange={(event) => {
              update({ rentStart: event.target.value });
            }}
          />
        )}
      </Field>
      <Field label="Fecha fin / prevista">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={entry.rentEnd ?? ""}
            onChange={(event) => {
              update({ rentEnd: event.target.value });
            }}
          />
        )}
      </Field>

      <div className="rounded-md border border-border bg-surface px-3 py-3 sm:col-span-2">
        <Checkbox
          label="La máquina lleva extintor"
          checked={Boolean(entry.hasExtinguisher)}
          onChange={(event) => {
            update({ hasExtinguisher: event.target.checked });
          }}
        />
      </div>

      {entry.hasExtinguisher && (
        <Field label="Próxima fecha de revisión del extintor" className="sm:col-span-2">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={entry.extinguisherDate ?? ""}
              onChange={(event) => {
                update({ extinguisherDate: event.target.value });
              }}
            />
          )}
        </Field>
      )}

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-sm font-medium text-ink-soft">Documentación de la máquina</span>
        <MachineDocuments
          documents={entry.documents ?? []}
          onUpload={(file) => void actions.uploadDocument(machine, file)}
          onOpen={(document) => void actions.openDocument(document)}
          onRemove={(document) => void removeDocument(document)}
        />
      </div>

      <Field label="Notas" className="sm:col-span-2">
        {(id) => (
          <Textarea
            id={id}
            rows={2}
            className="resize-y"
            placeholder="Observaciones sobre el alquiler"
            value={entry.notes ?? ""}
            onChange={(event) => {
              update({ notes: event.target.value });
            }}
          />
        )}
      </Field>

      <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={() => void release()}>
          <Unlock aria-hidden="true" />
          Liberar máquina
        </Button>
        <Button
          onClick={() => {
            onClose();
            notify.success("Datos guardados");
          }}
        >
          <Save aria-hidden="true" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
