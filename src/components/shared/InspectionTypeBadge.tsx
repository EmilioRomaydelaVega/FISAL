import { ArrowDownLeft, ArrowUpRight, Package } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { HistoryEntry } from "@/types/domain";

/** Etiqueta del tipo de registro del historial. */
export function InspectionTypeBadge({ type }: { type: HistoryEntry["type"] }) {
  if (type === "alquiler") {
    return (
      <Badge tone="success">
        <Package aria-hidden="true" />
        Alquiler
      </Badge>
    );
  }
  if (type === "salida") {
    return (
      <Badge tone="info">
        <ArrowUpRight aria-hidden="true" />
        Salida
      </Badge>
    );
  }
  return (
    <Badge tone="warning">
      <ArrowDownLeft aria-hidden="true" />
      Entrada
    </Badge>
  );
}
