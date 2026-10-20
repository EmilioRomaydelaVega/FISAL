import { useCallback, useEffect, useState } from "react";

import { PORTAL_CHECKLIST, PORTAL_HISTORY_LIMIT } from "@/constants/portal";
import { DEFAULT_MACHINE_ICON } from "@/constants/machines";
import {
  buildDailyCheck,
  toDailyCheckSummary,
  type DailyCheckFormData,
} from "@/lib/domain/daily-checks";
import { localDateStamp } from "@/lib/dates";
import { getErrorDetail } from "@/lib/errors";
import { notify } from "@/lib/notify";
import { dailyCheckFormSchema, firstIssue } from "@/lib/validation";
import { fetchMachineDailyChecks, saveDailyCheck } from "@/services/daily-checks.service";
import { fetchMachine } from "@/services/machines.service";
import type { ClientSession, DailyCheck, Machine, PortalCheckStatus } from "@/types/domain";

function createInitialForm(): DailyCheckFormData {
  return {
    checks: Object.fromEntries(PORTAL_CHECKLIST.map((item) => [item.id, "ok" as const])),
    hours: "",
    operator: "",
    incident: false,
    incidentDesc: "",
    signature: null,
    photos: [],
  };
}

type DailyCheckTextField = "hours" | "operator" | "incidentDesc";

export interface DailyCheckForm {
  machine: Machine | null;
  form: DailyCheckFormData;
  history: DailyCheck[];
  saving: boolean;
  setCheck: (itemId: string, status: PortalCheckStatus) => void;
  setField: (field: DailyCheckTextField, value: string) => void;
  setIncident: (incident: boolean) => void;
  setSignature: (signature: string | null) => void;
  setPhotos: (update: (photos: string[]) => string[]) => void;
  /** Valida y guarda el parte. Devuelve `true` si se ha enviado. */
  submit: () => Promise<boolean>;
}

/** Datos y envío del parte diario de una máquina. */
export function useDailyCheckForm(session: ClientSession, machineId: string): DailyCheckForm {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [form, setForm] = useState(createInitialForm);
  const [history, setHistory] = useState<DailyCheck[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [loadedMachine, checks] = await Promise.all([
        fetchMachine(machineId).catch(() => null),
        fetchMachineDailyChecks(machineId, session.id, PORTAL_HISTORY_LIMIT).catch(() => []),
      ]);
      if (cancelled) return;
      setMachine(
        loadedMachine ?? {
          id: machineId,
          name: machineId,
          serial: "",
          category: "",
          image: DEFAULT_MACHINE_ICON,
        },
      );
      setHistory(checks);
      // Si ya hay parte de hoy, se precarga para poder corregirlo.
      const today = checks.find((check) => check.date === localDateStamp());
      if (today) {
        setForm((current) => ({
          ...current,
          checks: { ...current.checks, ...today.checks },
          hours: today.hours,
          operator: today.operator,
          incident: today.incident,
          incidentDesc: today.incidentDesc,
        }));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [machineId, session.id]);

  const setCheck = useCallback((itemId: string, status: PortalCheckStatus) => {
    setForm((current) => ({ ...current, checks: { ...current.checks, [itemId]: status } }));
  }, []);

  const setField = useCallback((field: DailyCheckTextField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const setIncident = useCallback((incident: boolean) => {
    setForm((current) => ({ ...current, incident }));
  }, []);

  const setSignature = useCallback((signature: string | null) => {
    setForm((current) => ({ ...current, signature }));
  }, []);

  const setPhotos = useCallback((update: (photos: string[]) => string[]) => {
    setForm((current) => ({ ...current, photos: update(current.photos) }));
  }, []);

  const submit = async () => {
    const validation = dailyCheckFormSchema.safeParse(form);
    if (!validation.success) {
      notify.error(firstIssue(validation.error));
      return false;
    }
    const date = localDateStamp();
    const check = buildDailyCheck(session, machineId, machine, form, date);
    setSaving(true);
    try {
      await saveDailyCheck(check);
    } catch (error) {
      notify.error(`No se pudo guardar: ${getErrorDetail(error)}`);
      return false;
    } finally {
      setSaving(false);
    }
    notify.success("Parte diario enviado ✓");
    setHistory((current) => [
      toDailyCheckSummary(check),
      ...current.filter((item) => item.date !== date),
    ]);
    setPhotos(() => []);
    return true;
  };

  return {
    machine,
    form,
    history,
    saving,
    setCheck,
    setField,
    setIncident,
    setSignature,
    setPhotos,
    submit,
  };
}
