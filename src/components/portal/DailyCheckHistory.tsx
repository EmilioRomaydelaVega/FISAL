import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { hasIncident } from "@/lib/domain/daily-checks";
import type { DailyCheck } from "@/types/domain";

export function DailyCheckHistory({ checks }: { checks: readonly DailyCheck[] }) {
  if (checks.length === 0) return null;
  return (
    <Card>
      <Eyebrow className="mb-3">Mis partes anteriores</Eyebrow>
      <ul className="flex flex-col gap-2">
        {checks.map((check) => (
          <li
            key={check.date}
            className="flex items-center justify-between gap-3 rounded-md bg-surface-muted px-3 py-2 text-sm"
          >
            <span className="text-ink-soft">
              {check.date} · {check.operator}
            </span>
            <Badge tone={hasIncident(check) ? "danger" : "success"}>
              {hasIncident(check) ? "Con incidencia" : "Correcto"}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
