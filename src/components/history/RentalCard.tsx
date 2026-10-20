import { FileText, MapPin, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { InspectionTypeBadge } from "@/components/shared/InspectionTypeBadge";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import { PdfButton } from "@/components/shared/PdfButton";
import { hasIncidents } from "@/lib/domain/inspections";
import type { Inspection, MachineDocument, Rental } from "@/types/domain";

interface RentalCardProps {
  rental: Rental;
  inspections: readonly Inspection[];
  onDownload: (inspection: Inspection) => void;
  /** Id de la inspección cuyo PDF se está generando. */
  generatingId: string | null;
  onOpenDocument: (document: MachineDocument) => void;
  onRemove: () => void;
}

/** Alquiler archivado con sus inspecciones de salida y entrada. */
export function RentalCard({
  rental,
  inspections,
  onDownload,
  generatingId,
  onOpenDocument,
  onRemove,
}: RentalCardProps) {
  return (
    <article className="rounded-lg border border-l-4 border-border border-l-success bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <MachineAvatar icon={rental.machine.image} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">{rental.machine.name}</h3>
              <InspectionTypeBadge type="alquiler" />
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <User className="size-4 text-ink-muted" aria-hidden="true" />
              {rental.client}
            </p>
            {rental.location && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-muted">
                <MapPin className="size-4" aria-hidden="true" />
                {rental.location}
              </p>
            )}
            <p className="mt-1 text-sm text-ink-muted">
              {rental.rentStart || "—"} → {rental.rentEnd || rental.releasedAt}
            </p>
            {rental.notes && <p className="mt-1.5 text-sm text-ink-soft italic">{rental.notes}</p>}
          </div>
        </div>
        <Button variant="danger-soft" size="icon" aria-label="Eliminar alquiler" onClick={onRemove}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      {rental.documents.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rental.documents.map((document) => (
            <Button
              key={document.path}
              variant="secondary"
              size="sm"
              onClick={() => {
                onOpenDocument(document);
              }}
            >
              <FileText aria-hidden="true" />
              {document.name}
            </Button>
          ))}
        </div>
      )}

      {inspections.length > 0 && (
        <div className="mt-4 border-t border-dashed border-border pt-4">
          <Eyebrow className="mb-2">Inspecciones asociadas ({inspections.length})</Eyebrow>
          <ul className="flex flex-col gap-2">
            {inspections.map((inspection) => {
              const incidents = inspection.defectCount + inspection.failCount;
              return (
                <li
                  key={inspection.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2"
                >
                  <span className="flex flex-wrap items-center gap-2 text-sm text-ink-soft">
                    <InspectionTypeBadge type={inspection.type} />
                    {inspection.date} · {inspection.operator}
                    <Badge tone={hasIncidents(inspection) ? "warning" : "success"}>
                      {hasIncidents(inspection) ? `${incidents} incidencias` : "OK"}
                    </Badge>
                  </span>
                  <PdfButton
                    variant="secondary"
                    busy={generatingId === String(inspection.id)}
                    onClick={() => {
                      onDownload(inspection);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
