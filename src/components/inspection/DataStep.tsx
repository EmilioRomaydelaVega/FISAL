import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import type { InspectionFormAction, InspectionFormState } from "@/hooks/backoffice/inspection-form";
import { cn } from "@/lib/cn";
import { sameId } from "@/lib/text";
import { FUEL_LEVELS, type Machine } from "@/types/domain";

interface DataStepProps {
  form: InspectionFormState;
  machines: readonly Machine[];
  dispatch: (action: InspectionFormAction) => void;
}

const FUEL_OPTIONS = FUEL_LEVELS.map((level) => ({ value: level, label: level }));

export function DataStep({ form, machines, dispatch }: DataStepProps) {
  return (
    <section>
      <SectionHeading>Datos de la inspección</SectionHeading>
      <div className="grid gap-6">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink-soft">
            Selecciona la máquina<span className="ml-0.5 text-danger">*</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {machines.map((machine) => {
              const selected = form.machine ? sameId(form.machine.id, machine.id) : false;
              return (
                <button
                  key={machine.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    dispatch({ type: "setMachine", machine });
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-md border bg-surface p-3 text-left transition-colors",
                    selected
                      ? "border-brand bg-brand-soft ring-1 ring-brand"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  <MachineAvatar icon={machine.image} size="sm" className="bg-surface" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {machine.name}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">{machine.serial}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cliente / Empresa" required>
            {(id) => (
              <Input
                id={id}
                placeholder="Nombre del cliente…"
                value={form.client}
                onChange={(event) => {
                  dispatch({ type: "setText", field: "client", value: event.target.value });
                }}
              />
            )}
          </Field>
          <Field label="Operario responsable" required>
            {(id) => (
              <Input
                id={id}
                placeholder="Nombre del operario…"
                value={form.operator}
                onChange={(event) => {
                  dispatch({ type: "setText", field: "operator", value: event.target.value });
                }}
              />
            )}
          </Field>
          <Field label="Horómetro / Km actuales">
            {(id) => (
              <Input
                id={id}
                placeholder="ej. 1520 h"
                value={form.km}
                onChange={(event) => {
                  dispatch({ type: "setText", field: "km", value: event.target.value });
                }}
              />
            )}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">Nivel de combustible</span>
            <SegmentedControl
              label="Nivel de combustible"
              options={FUEL_OPTIONS}
              value={form.fuelLevel}
              onChange={(value) => {
                dispatch({ type: "setText", field: "fuelLevel", value });
              }}
            />
          </div>
        </div>

        <Field label="Notas generales">
          {(id) => (
            <Textarea
              id={id}
              rows={3}
              className="resize-none"
              placeholder="Observaciones iniciales…"
              value={form.notes}
              onChange={(event) => {
                dispatch({ type: "setText", field: "notes", value: event.target.value });
              }}
            />
          )}
        </Field>
      </div>
    </section>
  );
}
