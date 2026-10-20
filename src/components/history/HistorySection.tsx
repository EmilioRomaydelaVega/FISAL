import { ClipboardList, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/shared/ExportButtons";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import type { FleetActions } from "@/hooks/backoffice/useFleetActions";
import type { HistoryActions } from "@/hooks/backoffice/useHistoryActions";
import { localDateStamp } from "@/lib/dates";
import { historyExportRows } from "@/lib/domain/exports";
import { getRentalInspections, getTopLevelHistory, isRental } from "@/lib/domain/inspections";
import { plural } from "@/lib/text";
import type { HistoryEntry } from "@/types/domain";

import { InspectionCard } from "./InspectionCard";
import { RentalCard } from "./RentalCard";

interface HistorySectionProps {
  history: readonly HistoryEntry[];
  actions: HistoryActions;
  onOpenDocument: FleetActions["openDocument"];
  onStartInspection: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function HistorySection({
  history,
  actions,
  onOpenDocument,
  onStartInspection,
  confirm,
}: HistorySectionProps) {
  const count = history.length;

  const remove = async (entry: HistoryEntry) => {
    const rental = isRental(entry);
    const confirmed = await confirm({
      title: rental
        ? "¿Eliminar este alquiler del historial?"
        : "¿Eliminar esta inspección del historial?",
      description: rental ? "Las inspecciones asociadas seguirán visibles." : undefined,
      confirmLabel: "Eliminar",
    });
    if (confirmed) {
      await actions.removeEntry(entry, rental ? "Alquiler eliminado" : "Inspección eliminada");
    }
  };

  return (
    <div>
      <PageHeader
        title="Historial de inspecciones"
        description={`${count} ${plural(count, "inspección", "inspecciones")} ${plural(count, "registrada")}`}
        actions={
          <>
            <ExportButtons
              title="Historial de Inspecciones"
              fileName={`historial_${localDateStamp()}`}
              csvRows={() => historyExportRows(history)}
            />
            <Button size="sm" onClick={onStartInspection}>
              <Plus aria-hidden="true" />
              Nueva
            </Button>
          </>
        }
      />

      {count === 0 ? (
        <EmptyState
          icon={<ClipboardList />}
          title="No hay inspecciones registradas aún"
          action={
            <Button variant="secondary" onClick={onStartInspection}>
              Crear primera inspección
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {getTopLevelHistory(history).map((entry) => (
            <li key={entry.id}>
              {isRental(entry) ? (
                <RentalCard
                  rental={entry}
                  inspections={getRentalInspections(entry, history)}
                  onDownload={(inspection) => void actions.downloadReport(inspection)}
                  generatingId={actions.generatingId}
                  onOpenDocument={(document) => void onOpenDocument(document)}
                  onRemove={() => void remove(entry)}
                />
              ) : (
                <InspectionCard
                  inspection={entry}
                  onDownload={() => void actions.downloadReport(entry)}
                  generating={actions.generatingId === String(entry.id)}
                  onRemove={() => void remove(entry)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
