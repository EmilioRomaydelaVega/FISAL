import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { ExtinguisherStatus, RentEndWarning } from "@/lib/domain/fleet";
import { plural } from "@/lib/text";

function Note({
  className,
  icon,
  children,
}: {
  className: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "mt-1.5 flex items-center gap-1.5 text-xs font-semibold [&_svg]:size-3.5",
        className,
      )}
    >
      {icon}
      {children}
    </p>
  );
}

export function ExtinguisherNote({ status }: { status: ExtinguisherStatus }) {
  switch (status.kind) {
    case "expired":
      return (
        <Note className="text-danger-ink" icon={<AlertTriangle aria-hidden="true" />}>
          Extintor CADUCADO
        </Note>
      );
    case "soon":
      return (
        <Note className="text-warning-ink" icon={<Clock aria-hidden="true" />}>
          Extintor en {status.days} días
        </Note>
      );
    case "ok":
      return (
        <Note className="text-success-ink" icon={<CheckCircle2 aria-hidden="true" />}>
          Extintor OK ({status.days} días)
        </Note>
      );
  }
}

export function RentEndNote({ warning, rentEnd }: { warning: RentEndWarning; rentEnd: string }) {
  switch (warning.kind) {
    case "overdue":
      return (
        <Note className="text-danger-ink" icon={<AlertTriangle aria-hidden="true" />}>
          Alquiler vencido hace {warning.days} {plural(warning.days, "día")}
        </Note>
      );
    case "today":
      return (
        <Note className="text-danger-ink" icon={<AlertTriangle aria-hidden="true" />}>
          El alquiler finaliza HOY
        </Note>
      );
    case "soon":
      return (
        <Note className="text-warning-ink" icon={<Clock aria-hidden="true" />}>
          Alquiler finaliza en {warning.days} {plural(warning.days, "día")} ({rentEnd})
        </Note>
      );
  }
}
