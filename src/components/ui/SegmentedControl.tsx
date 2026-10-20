import { cn } from "@/lib/cn";

import type { Tone } from "./Badge";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  tone?: Tone;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nombre accesible del grupo. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

const selectedTones: Record<Tone, string> = {
  neutral: "border-ink-muted bg-surface-muted text-ink",
  brand: "border-brand bg-brand-soft text-brand-strong",
  success: "border-success bg-success-soft text-success-ink",
  warning: "border-warning bg-warning-soft text-warning-ink",
  danger: "border-danger bg-danger-soft text-danger-ink",
  info: "border-info bg-info-soft text-info-ink",
};

/** Grupo de botones de selección única (estado del checklist, combustible, gravedad…). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              onChange(option.value);
            }}
            className={cn(
              "flex-1 rounded-md border font-semibold whitespace-nowrap transition-colors",
              size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3 text-sm",
              selected
                ? selectedTones[option.tone ?? "brand"]
                : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
