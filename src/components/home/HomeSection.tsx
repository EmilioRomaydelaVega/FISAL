import { ArrowDownLeft, ArrowUpRight, FolderClock, Plus, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { InspectionTypeBadge } from "@/components/shared/InspectionTypeBadge";
import { MachineAvatar } from "@/components/shared/MachineAvatar";
import { cn } from "@/lib/cn";
import type { HistoryEntry } from "@/types/domain";

const FEATURES: { icon: LucideIcon; title: string; description: string; accent: string }[] = [
  {
    icon: ArrowUpRight,
    title: "Inspección de salida",
    description: "Documenta el estado antes de la entrega al cliente",
    accent: "bg-info-soft text-info-ink",
  },
  {
    icon: ArrowDownLeft,
    title: "Inspección de entrada",
    description: "Revisa y compara el estado a la devolución",
    accent: "bg-warning-soft text-warning-ink",
  },
  {
    icon: FolderClock,
    title: "Historial completo",
    description: "Accede a todos los registros anteriores",
    accent: "bg-success-soft text-success-ink",
  },
];

const RECENT_COUNT = 3;

interface HomeSectionProps {
  history: readonly HistoryEntry[];
  onStartInspection: () => void;
}

export function HomeSection({ history, onStartInspection }: HomeSectionProps) {
  const recent = history.slice(0, RECENT_COUNT);
  return (
    <div>
      <section className="mx-auto max-w-2xl py-8 text-center sm:py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Inspecciones de <span className="text-brand-strong">maquinaria</span>
        </h1>
        <p className="mt-3 text-ink-muted">
          Registra el estado de cada máquina antes de la salida y a la vuelta con fotos, checklist
          técnico y mapa de desperfectos.
        </p>
        <Button size="lg" className="mt-8" onClick={onStartInspection}>
          <Plus aria-hidden="true" />
          Nueva inspección
        </Button>
      </section>

      <ul className="mb-10 grid gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <li key={title}>
            <Card className="h-full text-center">
              <span
                className={cn(
                  "mx-auto mb-3 flex size-11 items-center justify-center rounded-full",
                  accent,
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-base font-bold">{title}</h2>
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            </Card>
          </li>
        ))}
      </ul>

      {recent.length > 0 && (
        <section>
          <Eyebrow className="mb-3">Últimas inspecciones</Eyebrow>
          <ul className="grid gap-2">
            {recent.map((entry) => (
              <li key={entry.id}>
                <Card padding="sm" className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <MachineAvatar icon={entry.machine.image} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{entry.machine.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {entry.client} · {entry.date}
                      </p>
                    </div>
                  </div>
                  <InspectionTypeBadge type={entry.type} />
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
