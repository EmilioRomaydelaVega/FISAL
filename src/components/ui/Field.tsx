import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldProps {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
  /** Recibe el id que debe llevar el control para quedar asociado a la etiqueta. */
  children: (id: string) => ReactNode;
}

/** Etiqueta, control y texto de ayuda de un campo de formulario. */
export function Field({ label, required, hint, className, children }: FieldProps) {
  const id = useId();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-soft">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
