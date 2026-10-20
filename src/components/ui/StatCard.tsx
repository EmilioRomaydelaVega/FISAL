import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import type { Tone } from "./Badge";

const valueTones: Record<Tone, string> = {
  neutral: "text-ink",
  brand: "text-brand-strong",
  success: "text-success-ink",
  warning: "text-warning-ink",
  danger: "text-danger-ink",
  info: "text-info-ink",
};

interface StatCardProps {
  label: ReactNode;
  value: number;
  tone?: Tone;
  /** Si se indica, la tarjeta actúa como filtro conmutado. */
  onToggle?: () => void;
  active?: boolean;
  dimmed?: boolean;
}

export function StatCard({
  label,
  value,
  tone = "neutral",
  onToggle,
  active,
  dimmed,
}: StatCardProps) {
  const content = (
    <>
      <span className={cn("font-display text-3xl font-bold", valueTones[tone])}>{value}</span>
      <span className="mt-1 text-xs font-medium tracking-wide text-ink-muted uppercase">
        {label}
      </span>
    </>
  );
  const className = cn(
    "flex flex-col items-center rounded-lg border bg-surface px-3 py-4 text-center shadow-card transition",
    active ? "border-brand ring-2 ring-brand/40" : "border-border",
    dimmed && "opacity-60",
  );

  if (!onToggle) return <div className={className}>{content}</div>;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(className, "hover:border-border-strong hover:shadow-raised")}
    >
      {content}
    </button>
  );
}
