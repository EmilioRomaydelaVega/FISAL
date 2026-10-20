import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InspectionTypeBadge } from "@/components/shared/InspectionTypeBadge";
import { INSPECTION_STEPS } from "@/constants/inspection";
import type { InspectionWizard as Wizard } from "@/hooks/backoffice/useInspectionWizard";
import type { Machine } from "@/types/domain";

import { ChecklistStep } from "./ChecklistStep";
import { DamageStep } from "./DamageStep";
import { DataStep } from "./DataStep";
import { InspectionTypePicker } from "./InspectionTypePicker";
import { PhotosStep } from "./PhotosStep";
import { SignatureStep } from "./SignatureStep";
import { StepIndicator } from "./StepIndicator";

interface InspectionWizardProps {
  wizard: Wizard;
  machines: readonly Machine[];
}

export function InspectionWizard({ wizard, machines }: InspectionWizardProps) {
  const { form, dispatch } = wizard;

  if (!form.type) {
    return (
      <InspectionTypePicker
        onSelect={(type) => {
          dispatch({ type: "setType", value: type });
        }}
      />
    );
  }

  const stepProps = { form, dispatch };

  return (
    <div className="mx-auto max-w-4xl">
      <StepIndicator steps={INSPECTION_STEPS} current={form.step} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <InspectionTypeBadge type={form.type} />
        {form.machine && (
          <span className="text-sm text-ink-muted">
            <span aria-hidden="true">{form.machine.image}</span> {form.machine.name}
          </span>
        )}
      </div>

      <Card padding="lg">
        {form.step === 0 && <DataStep {...stepProps} machines={machines} />}
        {form.step === 1 && <ChecklistStep {...stepProps} />}
        {form.step === 2 && <PhotosStep {...stepProps} />}
        {form.step === 3 && <DamageStep {...stepProps} />}
        {form.step === 4 && <SignatureStep {...stepProps} />}

        <div className="mt-8 flex justify-between gap-3 border-t border-border pt-5">
          <Button variant="secondary" onClick={wizard.goBack}>
            <ArrowLeft aria-hidden="true" />
            Atrás
          </Button>
          {wizard.isLastStep ? (
            <Button onClick={wizard.submit}>
              <Check aria-hidden="true" />
              Finalizar inspección
            </Button>
          ) : (
            // Sigue siendo pulsable sin los datos obligatorios: al pulsarlo explica qué falta.
            <Button
              onClick={wizard.goNext}
              className={wizard.canProceed ? undefined : "opacity-50"}
            >
              Siguiente
              <ArrowRight aria-hidden="true" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
