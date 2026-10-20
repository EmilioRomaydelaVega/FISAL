import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, MapPin, Truck } from "lucide-react";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { usePortalMachines } from "@/hooks/portal/usePortalMachines";
import { clientSessionStore } from "@/services/client-session.service";
import type { ClientSession } from "@/types/domain";

export function ClientMachinesPage({ session }: { session: ClientSession }) {
  const navigate = useNavigate();
  const { loading, machines } = usePortalMachines(session);

  const exit = () => {
    clientSessionStore.clear();
    void navigate({ to: "/cliente" });
  };

  return (
    <PortalLayout subtitle="Portal de cliente" onExit={exit}>
      <h1 className="text-2xl font-bold sm:text-3xl">Hola, {session.name || "cliente"}</h1>
      <p className="mt-1 mb-6 text-ink-muted">
        Tus máquinas alquiladas. Rellena el parte diario de cada una.
      </p>

      {loading && <Spinner />}

      {!loading && machines.length === 0 && (
        <EmptyState icon={<Truck />} title="No tienes máquinas alquiladas ahora mismo." />
      )}

      <ul className="grid gap-3">
        {machines.map(({ machine, fleet, checkedToday }) => (
          <li key={machine.id}>
            <Link
              to="/cliente/parte/$machineId"
              params={{ machineId: String(machine.id) }}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface p-4 shadow-card transition hover:border-border-strong hover:shadow-raised"
            >
              <MachineAvatar icon={machine.image} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-bold text-ink">{machine.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
                  {machine.serial}
                  {fleet.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {fleet.location}
                    </span>
                  )}
                </p>
              </div>
              <Badge tone={checkedToday ? "success" : "brand"}>
                {checkedToday ? "Parte enviado ✓" : "Pendiente hoy"}
              </Badge>
              <ChevronRight className="size-5 shrink-0 text-ink-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </PortalLayout>
  );
}
