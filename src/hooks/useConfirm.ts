import { useCallback, useRef, useState } from "react";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * Confirmaciones con diálogo propio en lugar de `window.confirm`.
 * `confirm()` devuelve una promesa; `request` se pasa a `<ConfirmDialog>`.
 */
export function useConfirm() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const pending = useRef<ConfirmRequest | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        pending.current?.resolve(false);
        const next: ConfirmRequest = {
          ...options,
          resolve: (confirmed) => {
            pending.current = null;
            setRequest(null);
            resolve(confirmed);
          },
        };
        pending.current = next;
        setRequest(next);
      }),
    [],
  );

  return { confirm, request };
}
