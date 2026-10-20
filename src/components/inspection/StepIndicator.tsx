import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

interface StepIndicatorProps {
  steps: readonly string[];
  current: number;
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const progress = ((current + 1) / steps.length) * 100;
  return (
    <nav aria-label="Progreso de la inspección" className="mb-6">
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="flex justify-between gap-2">
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={label}
              aria-current={active ? "step" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 sm:flex-row sm:gap-2"
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  done && "border-brand bg-brand text-brand-ink",
                  active && "border-brand bg-brand-soft text-brand-strong",
                  !done && !active && "border-border-strong text-ink-muted",
                )}
              >
                {done ? <Check className="size-3.5" aria-label="Completado" /> : index + 1}
              </span>
              <span
                className={cn(
                  "truncate text-xs font-medium",
                  active ? "text-ink" : "text-ink-muted",
                  !active && "hidden sm:inline",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
