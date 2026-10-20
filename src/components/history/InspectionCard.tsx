import {
  Camera,
  Clock,
  Download,
  Fuel,
  PenLine,
  Trash2,
  TriangleAlert,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InspectionTypeBadge } from "@/components/shared/InspectionTypeBadge";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import { cn } from "@/lib/cn";
import { getPhotoCount, hasIncidents } from "@/lib/domain/inspections";
import type { Inspection } from "@/types/domain";

const PREVIEW_PHOTOS = 6;

interface InspectionCardProps {
  inspection: Inspection;
  onDownload: () => void;
  onRemove: () => void;
}

export function InspectionCard({ inspection, onDownload, onRemove }: InspectionCardProps) {
  const photos = inspection.photos ?? [];
  const incidents = hasIncidents(inspection);

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <MachineAvatar icon={inspection.machine.image} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold">{inspection.machine.name}</h3>
              <InspectionTypeBadge type={inspection.type} />
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">
              {inspection.client} · {inspection.operator} · {inspection.date}
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted [&_svg]:size-3.5">
              <li className="flex items-center gap-1">
                <Fuel aria-hidden="true" />
                {inspection.fuelLevel}
              </li>
              {inspection.km && (
                <li className="flex items-center gap-1">
                  <Clock aria-hidden="true" />
                  {inspection.km}
                </li>
              )}
              <li className="flex items-center gap-1">
                <Camera aria-hidden="true" />
                {getPhotoCount(inspection)} fotos
              </li>
              <li
                className={cn(
                  "flex items-center gap-1",
                  inspection.failCount > 0 && "font-semibold text-danger-ink",
                )}
              >
                <Wrench aria-hidden="true" />
                {inspection.failCount} defectos checklist
              </li>
              <li
                className={cn(
                  "flex items-center gap-1",
                  inspection.defectCount > 0 && "font-semibold text-warning-ink",
                )}
              >
                <TriangleAlert aria-hidden="true" />
                {inspection.defectCount} desperfectos
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span className="flex items-center gap-1 text-xs text-ink-muted">
            <PenLine className="size-3.5" aria-hidden="true" />
            {inspection.signName}
          </span>
          <Badge tone={incidents ? "warning" : "success"}>
            {incidents ? "Con incidencias" : "Sin incidencias"}
          </Badge>
          <div className="flex gap-1.5">
            <Button size="sm" onClick={onDownload}>
              <Download aria-hidden="true" />
              PDF
            </Button>
            <Button
              variant="danger-soft"
              size="icon"
              aria-label="Eliminar inspección"
              onClick={onRemove}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {photos.slice(0, PREVIEW_PHOTOS).map((photo) => (
            <img
              key={photo.id}
              src={photo.src}
              alt=""
              className="size-16 shrink-0 rounded-md border border-border object-cover"
            />
          ))}
          {photos.length > PREVIEW_PHOTOS && (
            <span className="flex size-16 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-xs font-semibold text-ink-muted">
              +{photos.length - PREVIEW_PHOTOS}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
