import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { ClientFormValues } from "@/lib/validation";

const FIELDS: {
  name: keyof ClientFormValues;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}[] = [
  {
    name: "name",
    label: "Nombre / Empresa",
    placeholder: "Construcciones Ejemplo S.L.",
    required: true,
  },
  { name: "cif", label: "CIF", placeholder: "B12345678" },
  { name: "contact", label: "Persona de contacto", placeholder: "Nombre y apellidos" },
  { name: "phone", label: "Teléfono", placeholder: "600 000 000", type: "tel" },
  { name: "email", label: "Email", placeholder: "cliente@empresa.com", type: "email" },
  { name: "site", label: "Obra / Dirección", placeholder: "Obra o zona habitual" },
];

interface ClientFormProps {
  values: ClientFormValues;
  editing: boolean;
  onChange: (values: ClientFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Alta y edición de clientes. */
export function ClientForm({ values, editing, onChange, onSubmit, onCancel }: ClientFormProps) {
  return (
    <Card padding="lg" className="mb-8">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <h2 className="mb-4 text-base font-bold">
          {editing ? "Editar cliente" : "Alta de cliente"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <Field key={field.name} label={field.label} required={field.required}>
              {(id) => (
                <Input
                  id={id}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(event) => {
                    onChange({ ...values, [field.name]: event.target.value });
                  }}
                />
              )}
            </Field>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="submit">{editing ? "Guardar cambios" : "Crear cliente"}</Button>
          {editing && (
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
