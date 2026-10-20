import { ArrowDownLeft, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import type { InspectionType } from "@/types/domain";

const OPTIONS: {
  type: InspectionType;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}[] = [
  {
    type: "salida",
    icon: ArrowUpRight,
    title: "Inspección de salida",
    description: "La máquina sale a cliente. Documenta su estado actual.",
    accent: "bg-info-soft text-info-ink group-hover:border-info",
  },
  {
    type: "entrada",
    icon: ArrowDownLeft,
    title: "Inspección de entrada",
    description: "La máquina regresa. Compara y registra novedades.",
    accent: "bg-warning-soft text-warning-ink group-hover:border-warning",
  },
];

export function InspectionTypePicker({ onSelect }: { onSelect: (type: InspectionType) => void }) {
  return (
    <div className="mx-auto max-w-2xl py-4 text-center">
      <h1 className="text-2xl font-bold sm:text-3xl">Nueva inspección</h1>
      <p className="mt-2 text-ink-muted">¿Es una inspección de salida o de entrada?</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {OPTIONS.map(({ type, icon: Icon, title, description, accent }) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              onSelect(type);
            }}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-surface p-6 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full border-2 border-transparent transition-colors",
                accent,
              )}
            >
              <Icon className="size-7" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold text-ink">{title}</span>
            <span className="text-sm text-ink-muted">{description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
