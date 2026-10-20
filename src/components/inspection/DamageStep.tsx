import { CheckCircle2 } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { InspectionFormAction, InspectionFormState } from "@/hooks/backoffice/inspection-form";

import { DamageMapper } from "./DamageMapper";
import { StepErrorBoundary } from "./StepErrorBoundary";

interface DamageStepProps {
  form: InspectionFormState;
  dispatch: (action: InspectionFormAction) => void;
}

export function DamageStep({ form, dispatch }: DamageStepProps) {
  return (
    <section>
      <SectionHeading description="Marca las zonas afectadas en el diagrama y detalla el tipo y gravedad.">
        Mapa de desperfectos
      </SectionHeading>
      <StepErrorBoundary>
        <DamageMapper
          machine={form.machine}
          damages={form.damages}
          onAdd={(damage) => {
            dispatch({ type: "addDamage", damage });
          }}
          onRemove={(id) => {
            dispatch({ type: "removeDamage", id });
          }}
        />
      </StepErrorBoundary>
      {form.damages.length === 0 && (
        <Alert tone="success" icon={<CheckCircle2 />} className="mt-4">
          Sin desperfectos registrados
        </Alert>
      )}
    </section>
  );
}
