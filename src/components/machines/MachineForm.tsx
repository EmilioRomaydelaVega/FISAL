import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { MACHINE_ICONS } from "@/constants/machines";
import { cn } from "@/lib/cn";
import { EMPTY_MACHINE_FORM, type MachineFormValues } from "@/lib/validation";

interface MachineFormProps {
  /** Devuelve `true` si la máquina se ha añadido (y el formulario debe vaciarse). */
  onSubmit: (values: MachineFormValues) => boolean;
}

export function MachineForm({ onSubmit }: MachineFormProps) {
  const [values, setValues] = useState(EMPTY_MACHINE_FORM);
  const setField = (field: keyof MachineFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <Card padding="lg" className="mb-8">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (onSubmit(values)) setValues(EMPTY_MACHINE_FORM);
        }}
      >
        <h2 className="mb-4 text-base font-bold">Añadir nueva máquina</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre de la máquina" required>
            {(id) => (
              <Input
                id={id}
                placeholder="ej. Komatsu PC210LC-10"
                value={values.name}
                onChange={(event) => {
                  setField("name", event.target.value);
                }}
              />
            )}
          </Field>
          <Field label="Número de serie" required>
            {(id) => (
              <Input
                id={id}
                placeholder="ej. S/N K60365"
                value={values.serial}
                onChange={(event) => {
                  setField("serial", event.target.value);
                }}
              />
            )}
          </Field>
          <Field label="Categoría" required>
            {(id) => (
              <Input
                id={id}
                placeholder="ej. Excavadora"
                value={values.category}
                onChange={(event) => {
                  setField("category", event.target.value);
                }}
              />
            )}
          </Field>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-ink-soft">Icono</legend>
            <div className="flex flex-wrap gap-2">
              {MACHINE_ICONS.map((icon) => {
                const selected = values.image === icon;
                return (
                  <button
                    key={icon}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Icono ${icon}`}
                    onClick={() => {
                      setField("image", icon);
                    }}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md border-2 text-xl transition-colors",
                      selected
                        ? "border-brand bg-brand-soft"
                        : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit">
            <Plus aria-hidden="true" />
            Añadir máquina
          </Button>
        </div>
      </form>
    </Card>
  );
}
