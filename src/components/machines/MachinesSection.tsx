import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import type { MachineActions } from "@/hooks/backoffice/useMachineActions";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import { localDateStamp } from "@/lib/dates";
import { machineExportRows } from "@/lib/domain/exports";
import type { Machine } from "@/types/domain";

import { MachineForm } from "./MachineForm";

interface MachinesSectionProps {
  machines: readonly Machine[];
  actions: MachineActions;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function MachinesSection({ machines, actions, confirm }: MachinesSectionProps) {
  const remove = async (machine: Machine) => {
    const confirmed = await confirm({
      title: `¿Eliminar la máquina ${machine.name}?`,
      description: "Dejará de aparecer en inspecciones y flota. El historial se conserva.",
      confirmLabel: "Eliminar",
    });
    if (confirmed) actions.removeMachine(machine);
  };

  return (
    <div>
      <PageHeader
        title="Gestión de máquinas"
        description="Añade máquinas para usar en inspecciones y flota"
        actions={
          <ExportButtons
            title="Listado de Máquinas"
            fileName={`maquinas_${localDateStamp()}`}
            csvRows={() => machineExportRows(machines)}
          />
        }
      />

      <MachineForm onSubmit={actions.addMachine} />

      <Eyebrow className="mb-3">Todas las máquinas ({machines.length})</Eyebrow>
      {machines.length === 0 ? (
        <EmptyState icon={<Settings2 />} title="No hay máquinas registradas" />
      ) : (
        <ul className="flex flex-col gap-2">
          {machines.map((machine) => (
            <li key={machine.id}>
              <Card padding="sm" className="flex items-center gap-3">
                <MachineAvatar icon={machine.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{machine.name}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {machine.serial} · {machine.category}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => void remove(machine)}>
                  Eliminar
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
