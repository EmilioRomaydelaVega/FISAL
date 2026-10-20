import { AlarmClock, ClipboardList, X } from "lucide-react";
import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/shared/ExportButtons";
import type { ConfirmOptions } from "@/hooks/useConfirm";
import { utcDateStamp } from "@/lib/dates";
import {
  EMPTY_DAILY_CHECK_FILTERS,
  filterDailyChecks,
  findMachinesMissingCheck,
  type DailyCheckFilters,
} from "@/lib/domain/daily-checks";
import { dailyCheckExportRows } from "@/lib/domain/exports";
import type { Client, DailyCheck, FleetMap, Machine } from "@/types/domain";

import { DailyCheckCard } from "./DailyCheckCard";

interface DailyChecksSectionProps {
  dailyChecks: readonly DailyCheck[];
  clients: readonly Client[];
  machines: readonly Machine[];
  fleet: FleetMap;
  onRemove: (check: DailyCheck) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export function DailyChecksSection({
  dailyChecks,
  clients,
  machines,
  fleet,
  onRemove,
  confirm,
}: DailyChecksSectionProps) {
  const [filters, setFilters] = useState<DailyCheckFilters>(EMPTY_DAILY_CHECK_FILTERS);
  const [missingAlertHidden, setMissingAlertHidden] = useState(false);

  const today = utcDateStamp();
  const filtered = filterDailyChecks(dailyChecks, filters);
  const missing = findMachinesMissingCheck(machines, fleet, dailyChecks, today);
  const setFilter = (key: keyof DailyCheckFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const remove = async (check: DailyCheck) => {
    const confirmed = await confirm({
      title: `¿Eliminar el parte diario de ${check.machineName} del ${check.date}?`,
      confirmLabel: "Eliminar",
    });
    if (confirmed) await onRemove(check);
  };

  return (
    <div>
      <PageHeader
        title="Partes diarios"
        description="Partes enviados por los clientes desde el portal"
        actions={
          <ExportButtons
            title="Partes diarios de máquina"
            fileName={`partes_diarios_${today}`}
            csvRows={() => dailyCheckExportRows(filtered)}
          />
        }
      />

      {missing.length > 0 && !missingAlertHidden && (
        <Alert
          tone="brand"
          icon={<AlarmClock />}
          title={`Sin parte de hoy (${missing.length})`}
          className="mb-5"
          action={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ocultar aviso"
              className="-my-1 text-brand-strong"
              onClick={() => {
                setMissingAlertHidden(true);
              }}
            >
              <X aria-hidden="true" />
            </Button>
          }
        >
          {missing.map((machine) => machine.name).join(" · ")}
        </Alert>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Field label="Cliente">
          {(id) => (
            <Select
              id={id}
              value={filters.client}
              onChange={(event) => {
                setFilter("client", event.target.value);
              }}
            >
              <option value="">Todos</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Máquina">
          {(id) => (
            <Select
              id={id}
              value={filters.machine}
              onChange={(event) => {
                setFilter("machine", event.target.value);
              }}
            >
              <option value="">Todas</option>
              {machines.map((machine) => (
                <option key={machine.id} value={String(machine.id)}>
                  {machine.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Fecha">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={filters.date}
              onChange={(event) => {
                setFilter("date", event.target.value);
              }}
            />
          )}
        </Field>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ClipboardList />} title="Aún no hay partes diarios con esos filtros." />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((check) => (
            <li key={`${check.machineId}_${check.date}`}>
              <DailyCheckCard check={check} onRemove={() => void remove(check)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
