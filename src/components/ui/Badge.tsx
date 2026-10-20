import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-ink-muted ring-border",
  brand: "bg-brand-soft text-brand-strong ring-brand/30",
  success: "bg-success-soft text-success-ink ring-success/20",
  warning: "bg-warning-soft text-warning-ink ring-warning/20",
  danger: "bg-danger-soft text-danger-ink ring-danger/20",
  info: "bg-info-soft text-info-ink ring-info/20",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset [&_svg]:size-3.5",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
