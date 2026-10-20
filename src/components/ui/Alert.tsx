import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import type { Tone } from "./Badge";

const tones: Record<Tone, string> = {
  neutral: "border-border bg-surface-muted text-ink-soft",
  brand: "border-brand/30 bg-brand-soft text-brand-strong",
  success: "border-success/20 bg-success-soft text-success-ink",
  warning: "border-warning/25 bg-warning-soft text-warning-ink",
  danger: "border-danger/20 bg-danger-soft text-danger-ink",
  info: "border-info/20 bg-info-soft text-info-ink",
};

interface AlertProps {
  tone?: Tone;
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Alert({ tone = "neutral", icon, title, children, action, className }: AlertProps) {
  return (
    <div
      className={cn("flex gap-3 rounded-md border px-4 py-3 text-sm", tones[tone], className)}
      role={tone === "danger" ? "alert" : "status"}
    >
      {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-1", "opacity-90")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
