import { AlertTriangle, CalendarClock, CheckCircle2, Siren } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import type { Tone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { InspectionFormAction, InspectionFormState } from "@/hooks/backoffice/inspection-form";
import { formatDateTime } from "@/lib/dates";
import {
  computeOverallStatus,
  countChecklistStatus,
  type OverallStatus,
} from "@/lib/domain/inspections";
import { plural } from "@/lib/text";

const STATUS_DISPLAY: Record<OverallStatus, { tone: Tone; title: string; icon: React.ReactNode }> =
  {
    ok: { tone: "success", title: "Sin incidencias", icon: <CheckCircle2 /> },
    aviso: { tone: "warning", title: "Incidencias leves", icon: <AlertTriangle /> },
    grave: { tone: "danger", title: "Incidencias graves", icon: <Siren /> },
  };

interface SignatureStepProps {
  form: InspectionFormState;
  dispatch: (action: InspectionFormAction) => void;
}

export function SignatureStep({ form, dispatch }: SignatureStepProps) {
  const status = STATUS_DISPLAY[computeOverallStatus(form.checklist, form.damages)];
  const graveCount = form.damages.filter((damage) => damage.severity === "grave").length;
  const photoCount = form.photos.length;

  const summary: [string, string][] = [
    ["Máquina", form.machine ? `${form.machine.image} ${form.machine.name}` : "—"],
    ["Cliente", form.client],
    ["Operario", form.operator],
    ["Combustible", form.fuelLevel],
    ["Horómetro", form.km || "—"],
    ["Fotos", `${photoCount} ${plural(photoCount, "foto")}`],
  ];

  return (
    <section>
      <SectionHeading>Resumen y firma</SectionHeading>
      <dl className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-md border border-border bg-surface px-4 py-3">
            <dt className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</dt>
            <dd className="mt-1 truncate text-sm font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <Alert tone={status.tone} icon={status.icon} title={status.title} className="mb-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Checklist: {countChecklistStatus(form.checklist, "defecto")} defectos</span>
          <span>Desperfectos: {form.damages.length}</span>
          {graveCount > 0 && <span className="font-semibold">{graveCount} graves</span>}
        </div>
      </Alert>

      <Card>
        <p className="mb-4 text-sm text-ink-soft">
          Confirmo que los datos de esta inspección son correctos:
        </p>
        <Field label="Nombre completo del firmante" required>
          {(id) => (
            <Input
              id={id}
              placeholder="Nombre y apellidos…"
              value={form.signName}
              onChange={(event) => {
                dispatch({ type: "setText", field: "signName", value: event.target.value });
              }}
            />
          )}
        </Field>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          Fecha y hora: {formatDateTime()}
        </p>
      </Card>
    </section>
  );
}
