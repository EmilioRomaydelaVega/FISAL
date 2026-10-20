import { useEffect, useRef } from "react";

import type { ConfirmRequest } from "@/hooks/useConfirm";

import { Button } from "./Button";

/** Diálogo modal accesible para confirmar acciones. */
export function ConfirmDialog({ request }: { request: ConfirmRequest | null }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (request && !dialog.open) dialog.showModal();
    if (!request && dialog.open) dialog.close();
  }, [request]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl bg-surface p-0 text-ink shadow-overlay"
      onCancel={(event) => {
        event.preventDefault();
        request?.resolve(false);
      }}
    >
      {request && (
        <div className="p-6">
          <h2 id="confirm-title" className="text-lg font-bold">
            {request.title}
          </h2>
          {request.description && (
            <p className="mt-2 text-sm text-ink-muted">{request.description}</p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                request.resolve(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant={request.tone === "primary" ? "primary" : "danger"}
              onClick={() => {
                request.resolve(true);
              }}
            >
              {request.confirmLabel ?? "Confirmar"}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
