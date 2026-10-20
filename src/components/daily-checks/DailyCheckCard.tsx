import { AlertTriangle, Camera, Clock, HardHat, Trash2, User } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PORTAL_CHECK_STATUS_LABELS } from "@/constants/portal";
import { cn } from "@/lib/cn";
import { getFlaggedChecks, hasIncident } from "@/lib/domain/daily-checks";
import type { DailyCheck } from "@/types/domain";

interface DailyCheckCardProps {
  check: DailyCheck;
  onRemove: () => void;
}

export function DailyCheckCard({ check, onRemove }: DailyCheckCardProps) {
  const incident = hasIncident(check);
  const flagged = getFlaggedChecks(check);

  return (
    <article
      className={cn(
        "rounded-lg border border-l-4 border-border bg-surface p-4 shadow-card",
        incident ? "border-l-danger" : "border-l-success",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold">
            {check.machineName}{" "}
            <span className="font-normal text-ink-muted">· {check.machineSerial}</span>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted [&_svg]:size-3.5">
            <span>{check.date}</span>
            <span className="flex items-center gap-1">
              <User aria-hidden="true" />
              {check.clientName}
            </span>
            <span className="flex items-center gap-1">
              <HardHat aria-hidden="true" />
              {check.operator}
            </span>
            {check.hours && (
              <span className="flex items-center gap-1">
                <Clock aria-hidden="true" />
                {check.hours} h
              </span>
            )}
          </p>
          {check.incidentDesc && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-danger-ink">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {check.incidentDesc}
            </p>
          )}
          {flagged.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {flagged.map(([itemId, status]) => (
                <Badge key={itemId} tone={status === "fallo" ? "danger" : "warning"}>
                  {itemId}: {PORTAL_CHECK_STATUS_LABELS[status].toLowerCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={incident ? "danger" : "success"}>
            {incident ? "Con incidencia" : "Correcto"}
            {Boolean(check.photoCount) && (
              <>
                {" · "}
                <Camera aria-hidden="true" />
                {check.photoCount}
              </>
            )}
          </Badge>
          <Button variant="danger-soft" size="sm" onClick={onRemove}>
            <Trash2 aria-hidden="true" />
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
}
