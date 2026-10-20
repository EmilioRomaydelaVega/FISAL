import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SegmentedControl, type SegmentOption } from "@/components/ui/SegmentedControl";
import {
  CHECK_STATUS_LABELS,
  INSPECTION_CHECKLIST,
  INSPECTION_CHECKLIST_GROUPS,
} from "@/constants/inspection";
import type { InspectionFormAction, InspectionFormState } from "@/hooks/backoffice/inspection-form";
import { cn } from "@/lib/cn";
import { countChecklistStatus } from "@/lib/domain/inspections";
import { CHECK_STATUSES, type CheckStatus } from "@/types/domain";

const STATUS_OPTIONS: SegmentOption<CheckStatus>[] = [
  { value: "ok", label: CHECK_STATUS_LABELS.ok, tone: "success" },
  { value: "defecto", label: CHECK_STATUS_LABELS.defecto, tone: "danger" },
  { value: "n/a", label: CHECK_STATUS_LABELS["n/a"], tone: "neutral" },
];

const COUNTER_TONES = { ok: "success", defecto: "danger", "n/a": "neutral" } as const;

interface ChecklistStepProps {
  form: InspectionFormState;
  dispatch: (action: InspectionFormAction) => void;
}

export function ChecklistStep({ form, dispatch }: ChecklistStepProps) {
  return (
    <section>
      <SectionHeading>Checklist técnico</SectionHeading>
      <div className="mb-6 flex flex-wrap gap-2">
        {CHECK_STATUSES.map((status) => (
          <Badge key={status} tone={COUNTER_TONES[status]}>
            {CHECK_STATUS_LABELS[status]}: {countChecklistStatus(form.checklist, status)}
          </Badge>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {INSPECTION_CHECKLIST_GROUPS.map((group) => (
          <fieldset key={group}>
            <legend className="mb-2 w-full border-b border-border pb-1.5 text-xs font-semibold tracking-wider text-ink-muted uppercase">
              {group}
            </legend>
            <ul className="flex flex-col gap-2">
              {INSPECTION_CHECKLIST.filter((item) => item.group === group).map((item) => {
                const status = form.checklist[item.id] ?? "ok";
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "rounded-md border bg-surface p-3",
                      status === "defecto" ? "border-danger/40" : "border-border",
                    )}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium text-ink-soft">
                        <span aria-hidden="true">{item.icon}</span> {item.label}
                      </span>
                      <SegmentedControl
                        label={item.label}
                        size="sm"
                        className="sm:w-72"
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={(value) => {
                          dispatch({ type: "setCheck", itemId: item.id, status: value });
                        }}
                      />
                    </div>
                    {status === "defecto" && (
                      <Input
                        aria-label={`Defecto en ${item.label}`}
                        className="mt-2 h-9"
                        placeholder="Describe el defecto encontrado…"
                        value={form.checkNotes[item.id] ?? ""}
                        onChange={(event) => {
                          dispatch({
                            type: "setCheckNote",
                            itemId: item.id,
                            note: event.target.value,
                          });
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
