import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Send } from "lucide-react";
import { useEffect, useRef } from "react";

import { PortalLayout } from "@/components/layout/PortalLayout";
import { DailyCheckHistory } from "@/components/portal/DailyCheckHistory";
import { PortalPhotoPicker } from "@/components/portal/PortalPhotoPicker";
import { SignaturePad } from "@/components/portal/SignaturePad";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import {
  PORTAL_CHECK_STATUS_LABELS,
  PORTAL_CHECKLIST,
  PORTAL_REDIRECT_DELAY_MS,
} from "@/constants/portal";
import { useDailyCheckForm } from "@/hooks/portal/useDailyCheckForm";
import { formatDate } from "@/lib/dates";
import type { ClientSession, PortalCheckStatus } from "@/types/domain";

const STATUS_OPTIONS: SegmentOption<PortalCheckStatus>[] = [
  { value: "ok", label: PORTAL_CHECK_STATUS_LABELS.ok, tone: "success" },
  { value: "atencion", label: PORTAL_CHECK_STATUS_LABELS.atencion, tone: "warning" },
  { value: "fallo", label: PORTAL_CHECK_STATUS_LABELS.fallo, tone: "danger" },
];

interface DailyCheckPageProps {
  session: ClientSession;
  machineId: string;
}

export function DailyCheckPage({ session, machineId }: DailyCheckPageProps) {
  const navigate = useNavigate();
  const daily = useDailyCheckForm(session, machineId);
  const { form, machine } = daily;
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(redirectTimer.current);
    },
    [],
  );

  const backToMachines = () => {
    void navigate({ to: "/cliente/maquinas" });
  };

  const submit = async () => {
    if (await daily.submit()) {
      redirectTimer.current = setTimeout(backToMachines, PORTAL_REDIRECT_DELAY_MS);
    }
  };

  return (
    <PortalLayout subtitle="Parte diario" onExit={backToMachines} exitLabel="Salir">
      <div className="grid gap-4">
        <Card className="flex items-center gap-4">
          <MachineAvatar icon={machine?.image ?? "🚜"} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">{machine?.name ?? "Máquina"}</h1>
            <p className="text-sm text-ink-muted">
              {machine?.serial} · {formatDate()}
            </p>
          </div>
        </Card>

        <Card>
          <Eyebrow className="mb-3 text-brand-strong">Checklist rápido</Eyebrow>
          <ul className="grid gap-2">
            {PORTAL_CHECKLIST.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-medium text-ink-soft">
                  <span aria-hidden="true">{item.icon}</span> {item.label}
                </span>
                <SegmentedControl
                  label={item.label}
                  size="sm"
                  className="sm:w-64"
                  options={STATUS_OPTIONS}
                  value={form.checks[item.id] ?? "ok"}
                  onChange={(status) => {
                    daily.setCheck(item.id, status);
                  }}
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Horómetro (horas)">
            {(id) => (
              <Input
                id={id}
                inputMode="decimal"
                placeholder="Ej. 4.520"
                value={form.hours}
                onChange={(event) => {
                  daily.setField("hours", event.target.value);
                }}
              />
            )}
          </Field>
          <Field label="Operador" required>
            {(id) => (
              <Input
                id={id}
                autoComplete="name"
                placeholder="Nombre y apellidos"
                value={form.operator}
                onChange={(event) => {
                  daily.setField("operator", event.target.value);
                }}
              />
            )}
          </Field>
        </Card>

        <Card>
          <Checkbox
            label={
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
                Hay una incidencia que comunicar
              </span>
            }
            checked={form.incident}
            onChange={(event) => {
              daily.setIncident(event.target.checked);
            }}
          />
          {form.incident && (
            <Textarea
              aria-label="Descripción de la incidencia"
              rows={3}
              className="mt-3 resize-none"
              placeholder="Describe la incidencia…"
              value={form.incidentDesc}
              onChange={(event) => {
                daily.setField("incidentDesc", event.target.value);
              }}
            />
          )}
        </Card>

        <Card>
          <Eyebrow className="mb-3 text-brand-strong">Fotos</Eyebrow>
          <PortalPhotoPicker photos={form.photos} onChange={daily.setPhotos} />
        </Card>

        <Card>
          <Eyebrow className="mb-3 text-brand-strong">Firma del operador</Eyebrow>
          <SignaturePad onChange={daily.setSignature} />
        </Card>

        <Button size="lg" className="w-full" disabled={daily.saving} onClick={() => void submit()}>
          <Send aria-hidden="true" />
          {daily.saving ? "Enviando…" : "Enviar parte diario"}
        </Button>

        <DailyCheckHistory checks={daily.history} />
      </div>
    </PortalLayout>
  );
}
