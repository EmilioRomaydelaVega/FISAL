import { Truck } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ExportButtons } from "@/components/shared/ExportButtons";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import type { FleetActions } from "@/hooks/backoffice/useFleetActions";
import { utcDateStamp } from "@/lib/dates";
import { fleetExportRows } from "@/lib/domain/exports";
import {
  computeFleetStats,
  filterFleet,
  getFleetEntry,
  type FleetFilter,
} from "@/lib/domain/fleet";
import type { Client, FleetMap, Machine } from "@/types/domain";

import { FleetMachineCard } from "./FleetMachineCard";

interface FleetSectionProps {
  machines: readonly Machine[];
  fleet: FleetMap;
  clients: readonly Client[];
  actions: FleetActions;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function FleetSection({ machines, fleet, clients, actions, confirm }: FleetSectionProps) {
  const [filter, setFilter] = useState<FleetFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = computeFleetStats(machines, fleet);
  const visible = filterFleet(machines, fleet, filter);
  const toggleFilter = (value: Exclude<FleetFilter, "all">) => {
    setFilter((current) => (current === value ? "all" : value));
  };

  return (
    <div>
      <PageHeader
        title="Gestión de flota"
        description="Alquileres activos, ubicación, extintor y próxima revisión"
        actions={
          <ExportButtons
            title="Registro de Flota"
            fileName={`flota_${utcDateStamp()}`}
            csvRows={() => fleetExportRows(machines, fleet)}
          />
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Alquiladas"
          value={stats.rented}
          tone="brand"
          active={filter === "rented"}
          dimmed={filter === "available"}
          onToggle={() => {
            toggleFilter("rented");
          }}
        />
        <StatCard
          label="Disponibles"
          value={stats.available}
          tone="success"
          active={filter === "available"}
          dimmed={filter === "rented"}
          onToggle={() => {
            toggleFilter("available");
          }}
        />
        <StatCard label="Extintor <30 días" value={stats.extinguisherSoon} tone="warning" />
        <StatCard label="Extintor caducado" value={stats.extinguisherExpired} tone="danger" />
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<Truck />} title="No hay máquinas en esta vista" />
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((machine) => {
            const key = String(machine.id);
            return (
              <li key={key}>
                <FleetMachineCard
                  machine={machine}
                  entry={getFleetEntry(fleet, machine.id)}
                  clients={clients}
                  expanded={expandedId === key}
                  onToggle={() => {
                    setExpandedId((current) => (current === key ? null : key));
                  }}
                  actions={actions}
                  confirm={confirm}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
