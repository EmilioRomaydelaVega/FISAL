import { CheckCircle2, MapPin, MousePointerClick, X } from "lucide-react";
import { useState } from "react";

import { Badge, type Tone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Select, Textarea } from "@/components/ui/Input";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import {
  DAMAGE_SEVERITY_LABELS,
  DAMAGE_TYPES,
  DAMAGE_ZONES,
  type DamageZone,
} from "@/constants/inspection";
import { cn } from "@/lib/cn";
import { createId } from "@/lib/ids";
import { EMPTY_DAMAGE_FORM, type DamageFormValues } from "@/lib/validation";
import type { Damage, DamageSeverity, Machine } from "@/types/domain";

const SEVERITY_TONES: Record<DamageSeverity, Tone> = {
  leve: "success",
  moderado: "warning",
  grave: "danger",
};

const SEVERITY_OPTIONS: SegmentOption<DamageSeverity>[] = (
  ["leve", "moderado", "grave"] as const
).map((severity) => ({
  value: severity,
  label: DAMAGE_SEVERITY_LABELS[severity],
  tone: SEVERITY_TONES[severity],
}));

function zoneLabel(zoneId: string): string {
  return DAMAGE_ZONES.find((zone) => zone.id === zoneId)?.label ?? zoneId;
}

interface DamageMapperProps {
  machine: Machine | null;
  damages: readonly Damage[];
  onAdd: (damage: Damage) => void;
  onRemove: (id: Damage["id"]) => void;
}

/** Diagrama de zonas de la máquina para registrar desperfectos. */
export function DamageMapper({ machine, damages, onAdd, onRemove }: DamageMapperProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [form, setForm] = useState<DamageFormValues>(EMPTY_DAMAGE_FORM);
  const [justAdded, setJustAdded] = useState(false);

  const selectZone = (zoneId: string) => {
    setActiveZone((current) => (current === zoneId ? null : zoneId));
    setJustAdded(false);
  };

  const addDamage = () => {
    if (!activeZone) return;
    onAdd({ id: createId.damage(), zone: activeZone, ...form });
    setActiveZone(null);
    setForm(EMPTY_DAMAGE_FORM);
    setJustAdded(true);
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div>
        <Eyebrow className="mb-2">Toca una zona para marcar desperfecto</Eyebrow>
        <div className="relative aspect-square rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="absolute inset-4 rounded-lg border border-border bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--color-surface-muted)_10px,var(--color-surface-muted)_11px)]" />
          <div className="absolute inset-7 flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-border">
            <span className="text-7xl leading-none opacity-40" aria-hidden="true">
              {machine?.image ?? "🚜"}
            </span>
            {machine && (
              <div className="text-center">
                <p className="text-xs font-semibold text-ink-muted">{machine.name}</p>
                <p className="text-[11px] text-ink-muted">{machine.serial}</p>
              </div>
            )}
          </div>
          {DAMAGE_ZONES.map((zone) => (
            <ZoneButton
              key={zone.id}
              zone={zone}
              active={activeZone === zone.id}
              damaged={damages.some((damage) => damage.zone === zone.id)}
              onSelect={selectZone}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted">
          <LegendDot className="border-border-strong bg-surface">Sin daño</LegendDot>
          <LegendDot className="border-danger bg-danger-soft">Con daño</LegendDot>
          <LegendDot className="border-brand bg-brand-soft">Seleccionado</LegendDot>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {activeZone ? (
          <Card className="border-brand/50">
            <p className="mb-4 flex items-center gap-2 font-semibold text-brand-strong">
              <MapPin className="size-4" aria-hidden="true" />
              {zoneLabel(activeZone)}
            </p>
            <div className="flex flex-col gap-3">
              <Field label="Tipo de desperfecto">
                {(id) => (
                  <Select
                    id={id}
                    value={form.type}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, type: event.target.value }));
                    }}
                  >
                    {DAMAGE_TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </Select>
                )}
              </Field>
              <SegmentedControl
                label="Gravedad"
                options={SEVERITY_OPTIONS}
                value={form.severity}
                onChange={(severity) => {
                  setForm((current) => ({ ...current, severity }));
                }}
              />
              <Textarea
                aria-label="Descripción del desperfecto"
                rows={3}
                className="resize-none"
                placeholder="Descripción del desperfecto…"
                value={form.desc}
                onChange={(event) => {
                  setForm((current) => ({ ...current, desc: event.target.value }));
                }}
              />
              <Button onClick={addDamage}>Registrar desperfecto</Button>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center gap-2 py-6 text-center">
            {justAdded ? (
              <>
                <CheckCircle2 className="size-7 text-success" aria-hidden="true" />
                <p className="text-sm font-semibold text-success-ink">
                  Desperfecto registrado correctamente
                </p>
                <p className="text-sm text-ink-muted">
                  Puedes marcar otra zona o pulsar Siguiente para continuar
                </p>
              </>
            ) : (
              <>
                <MousePointerClick className="size-7 text-ink-muted" aria-hidden="true" />
                <p className="text-sm text-ink-muted">
                  Selecciona una zona en el diagrama para registrar un desperfecto
                </p>
              </>
            )}
          </Card>
        )}

        {damages.length > 0 && (
          <div>
            <Eyebrow className="mb-2">Desperfectos registrados</Eyebrow>
            <ul className="flex flex-col gap-2">
              {damages.map((damage) => (
                <li
                  key={damage.id}
                  className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {zoneLabel(damage.zone)} · {damage.type}
                    </p>
                    {damage.desc && <p className="mt-0.5 text-sm text-ink-muted">{damage.desc}</p>}
                    <Badge tone={SEVERITY_TONES[damage.severity]} className="mt-2">
                      {DAMAGE_SEVERITY_LABELS[damage.severity]}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Eliminar desperfecto"
                    onClick={() => {
                      onRemove(damage.id);
                    }}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface ZoneButtonProps {
  zone: DamageZone;
  active: boolean;
  damaged: boolean;
  onSelect: (zoneId: string) => void;
}

function ZoneButton({ zone, active, damaged, onSelect }: ZoneButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${zone.label}${damaged ? " (con daño)" : ""}`}
      title={zone.label}
      onClick={() => {
        onSelect(zone.id);
      }}
      style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
      className={cn(
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-bold shadow-card transition-all",
        active
          ? "size-10 border-brand bg-brand-soft text-brand-strong ring-4 ring-brand/25"
          : "size-8",
        !active && damaged && "border-danger bg-danger-soft text-danger-ink",
        !active && !damaged && "border-border-strong bg-surface text-ink-muted hover:border-brand",
      )}
    >
      {damaged ? "!" : "+"}
    </button>
  );
}

function LegendDot({ className, children }: { className: string; children: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded-full border-2", className)} aria-hidden="true" />
      {children}
    </span>
  );
}
