import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  children: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function SectionHeading({ children, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-5", className)}>
      <h2 className="text-lg font-bold">{children}</h2>
      {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
    </div>
  );
}

/** Rótulo pequeño en mayúsculas para agrupar contenido. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold tracking-wider text-ink-muted uppercase", className)}>
      {children}
    </p>
  );
}
