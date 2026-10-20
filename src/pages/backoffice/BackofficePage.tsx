import { useCallback, useState } from "react";

import { ClientsSection } from "@/components/clients/ClientsSection";
import { DailyChecksSection } from "@/components/daily-checks/DailyChecksSection";
import { FleetSection } from "@/components/fleet/FleetSection";
import { HistorySection } from "@/components/history/HistorySection";
import { HomeSection } from "@/components/home/HomeSection";
import { InspectionWizard } from "@/components/inspection/InspectionWizard";
import { BackofficeHeader, type BackofficeView } from "@/components/layout/BackofficeHeader";
import { MachinesSection } from "@/components/machines/MachinesSection";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { useBackofficeData } from "@/hooks/backoffice/useBackofficeData";
import { useClientActions } from "@/hooks/backoffice/useClientActions";
import { useDailyCheckActions } from "@/hooks/backoffice/useDailyCheckActions";
import { useFleetActions } from "@/hooks/backoffice/useFleetActions";
import { useHistoryActions } from "@/hooks/backoffice/useHistoryActions";
import { useInspectionWizard } from "@/hooks/backoffice/useInspectionWizard";
import { useMachineActions } from "@/hooks/backoffice/useMachineActions";
import { useConfirm } from "@/hooks/useConfirm";
import type { Inspection } from "@/types/domain";

/** Backoffice de FISALRENT: inspecciones, máquinas, flota, clientes y partes diarios. */
export function BackofficePage() {
  const [view, setView] = useState<BackofficeView>("home");
  const [state, dispatch] = useBackofficeData();
  const { confirm, request } = useConfirm();

  const historyActions = useHistoryActions(dispatch);
  const fleetActions = useFleetActions(state.fleet, state.history, dispatch);
  const machineActions = useMachineActions(dispatch);
  const clientActions = useClientActions(dispatch);
  const { removeDailyCheck } = useDailyCheckActions(dispatch);

  const { submitInspection } = historyActions;
  const handleSubmit = useCallback(
    (inspection: Inspection) => {
      setView("history");
      void submitInspection(inspection);
    },
    [submitInspection],
  );
  const wizard = useInspectionWizard({
    onDraftRestored: useCallback(() => {
      setView("new");
    }, []),
    onSubmit: handleSubmit,
  });

  const navigate = (next: BackofficeView) => {
    setView(next);
    // Salir del asistente descarta la inspección en curso; entrar vuelve al primer paso.
    if (next === "new") wizard.goToStart();
    else wizard.reset();
  };

  const startInspection = () => {
    setView("new");
  };

  return (
    <div className="min-h-dvh">
      <BackofficeHeader current={view} onNavigate={navigate} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {state.loading && view !== "new" && <Spinner className="mb-4" />}

        {view === "home" && (
          <HomeSection history={state.history} onStartInspection={startInspection} />
        )}
        {view === "new" && <InspectionWizard wizard={wizard} machines={state.machines} />}
        {view === "machines" && (
          <MachinesSection machines={state.machines} actions={machineActions} confirm={confirm} />
        )}
        {view === "fleet" && (
          <FleetSection
            machines={state.machines}
            fleet={state.fleet}
            clients={state.clients}
            actions={fleetActions}
            confirm={confirm}
          />
        )}
        {view === "clients" && (
          <ClientsSection
            clients={state.clients}
            machines={state.machines}
            fleet={state.fleet}
            actions={clientActions}
            confirm={confirm}
          />
        )}
        {view === "checks" && (
          <DailyChecksSection
            dailyChecks={state.dailyChecks}
            clients={state.clients}
            machines={state.machines}
            fleet={state.fleet}
            onRemove={removeDailyCheck}
            confirm={confirm}
          />
        )}
        {view === "history" && (
          <HistorySection
            history={state.history}
            actions={historyActions}
            onOpenDocument={fleetActions.openDocument}
            onStartInspection={startInspection}
            confirm={confirm}
          />
        )}
      </main>
      <ConfirmDialog request={request} />
    </div>
  );
}
