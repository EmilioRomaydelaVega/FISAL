import { ChevronDown, FireExtinguisher, MapPin, User } from "lucide-react";
import { useId } from "react";

import { Badge } from "@/components/ui/Badge";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import type { FleetActions } from "@/hooks/backoffice/useFleetActions";
import { cn } from "@/lib/cn";
import { getExtinguisherStatus, getRentEndWarning, isRented } from "@/lib/domain/fleet";
import type { Client, FleetEntry, Machine } from "@/types/domain";

import { FleetMachineEditor } from "./FleetMachineEditor";
import { ExtinguisherNote, RentEndNote } from "./FleetStatusNotes";

interface FleetMachineCardProps {
  machine: Machine;
  entry: FleetEntry;
  clients: readonly Client[];
  expanded: boolean;
  onToggle: () => void;
  actions: FleetActions;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function FleetMachineCard({
  machine,
  entry,
  clients,
  expanded,
  onToggle,
  actions,
  confirm,
}: FleetMachineCardProps) {
  const panelId = useId();
  const rented = isRented(entry);
  const extinguisher = getExtinguisherStatus(entry);
  const rentEnd = getRentEndWarning(entry);

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-surface-muted/50"
      >
        <div className="flex min-w-0 gap-3">
          <MachineAvatar icon={machine.image} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold">{machine.name}</h3>
            <p className="truncate text-xs text-ink-muted">
              {machine.serial} · {machine.category}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-soft">
              <Badge tone={rented ? "brand" : "success"}>
                {rented ? "Alquilada" : "Disponible"}
              </Badge>
              {rented && (
                <span className="flex items-center gap-1">
                  <User className="size-3.5 text-ink-muted" aria-hidden="true" />
                  {entry.client}
                </span>
              )}
              {rented && entry.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-ink-muted" aria-hidden="true" />
                  {entry.location}
                </span>
              )}
              {entry.hasExtinguisher ? (
                <span className="flex items-center gap-1">
                  <FireExtinguisher className="size-3.5 text-ink-muted" aria-hidden="true" />
                  Con extintor
                </span>
              ) : (
                <Badge tone="danger">Sin extintor</Badge>
              )}
            </div>
            {extinguisher && <ExtinguisherNote status={extinguisher} />}
            {rentEnd && <RentEndNote warning={rentEnd} rentEnd={entry.rentEnd ?? ""} />}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-ink-muted transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id={panelId}>
          <FleetMachineEditor
            machine={machine}
            entry={entry}
            clients={clients}
            actions={actions}
            confirm={confirm}
            onClose={onToggle}
          />
        </div>
      )}
    </article>
  );
}
