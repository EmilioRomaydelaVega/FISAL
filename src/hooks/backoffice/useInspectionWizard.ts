import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import { buildInspection } from "@/lib/domain/inspections";
import { notify } from "@/lib/notify";
import { firstIssue, inspectionDataSchema, signatureSchema } from "@/lib/validation";
import { inspectionDraftStore } from "@/services/inspection-draft.service";
import type { Inspection } from "@/types/domain";

import {
  createInitialForm,
  fromDraft,
  inspectionFormReducer,
  LAST_STEP,
  toDraft,
  type InspectionFormAction,
  type InspectionFormState,
} from "./inspection-form";

const DRAFT_SAVE_DELAY_MS = 400;

interface UseInspectionWizardOptions {
  /** Se llama cuando se recupera un borrador al abrir la aplicación. */
  onDraftRestored: () => void;
  /** Recibe la inspección finalizada. */
  onSubmit: (inspection: Inspection) => void;
}

export interface InspectionWizard {
  form: InspectionFormState;
  dispatch: (action: InspectionFormAction) => void;
  canProceed: boolean;
  isLastStep: boolean;
  goBack: () => void;
  goNext: () => void;
  goToStart: () => void;
  submit: () => void;
  /** Vacía el formulario y borra el borrador guardado. */
  reset: () => void;
}

/** Estado, navegación, borrador automático y envío del asistente de inspección. */
export function useInspectionWizard({
  onDraftRestored,
  onSubmit,
}: UseInspectionWizardOptions): InspectionWizard {
  const [form, dispatch] = useReducer(inspectionFormReducer, undefined, createInitialForm);
  const draftLoaded = useRef(false);
  const onDraftRestoredRef = useRef(onDraftRestored);
  useEffect(() => {
    onDraftRestoredRef.current = onDraftRestored;
  }, [onDraftRestored]);

  useEffect(() => {
    let alive = true;
    inspectionDraftStore
      .load()
      .then((value) => {
        if (!alive) return;
        draftLoaded.current = true;
        const restored = fromDraft(value);
        if (!restored) return;
        dispatch({ type: "restore", state: restored });
        onDraftRestoredRef.current();
        notify.info("Se ha recuperado la inspección que tenías a medias");
      })
      .catch(() => {
        draftLoaded.current = true;
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const { type } = form;
    if (!draftLoaded.current || !type) return;
    const timer = setTimeout(() => {
      inspectionDraftStore.save(toDraft({ ...form, type })).catch((error: unknown) => {
        console.error(error);
      });
    }, DRAFT_SAVE_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [form]);

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    inspectionDraftStore.clear().catch(() => undefined);
  }, []);

  // Solo el paso "Datos" tiene campos obligatorios para avanzar.
  const stepValidation = useMemo(
    () => (form.step === 0 ? inspectionDataSchema.safeParse(form) : ({ success: true } as const)),
    [form],
  );
  const canProceed = stepValidation.success;

  const goNext = useCallback(() => {
    if (!stepValidation.success) {
      notify.error(firstIssue(stepValidation.error));
      return;
    }
    dispatch({ type: "setStep", step: form.step + 1 });
  }, [form.step, stepValidation]);

  const goBack = useCallback(() => {
    if (form.step === 0) dispatch({ type: "setType", value: null });
    else dispatch({ type: "setStep", step: form.step - 1 });
  }, [form.step]);

  const goToStart = useCallback(() => {
    dispatch({ type: "setStep", step: 0 });
  }, []);

  const submit = useCallback(() => {
    const signature = signatureSchema.safeParse(form.signName);
    if (!signature.success) {
      notify.error(firstIssue(signature.error));
      return;
    }
    if (!form.type || !form.machine) return;
    onSubmit(buildInspection({ ...form, type: form.type, machine: form.machine }));
    reset();
  }, [form, onSubmit, reset]);

  return {
    form,
    dispatch,
    canProceed,
    isLastStep: form.step === LAST_STEP,
    goBack,
    goNext,
    goToStart,
    submit,
    reset,
  };
}
