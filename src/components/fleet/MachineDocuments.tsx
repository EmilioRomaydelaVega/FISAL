import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/dates";
import type { MachineDocument } from "@/types/domain";

interface MachineDocumentsProps {
  documents: readonly MachineDocument[];
  onUpload: (file: File) => void;
  onOpen: (document: MachineDocument) => void;
  onRemove: (document: MachineDocument) => void;
}

export function MachineDocuments({ documents, onUpload, onOpen, onRemove }: MachineDocumentsProps) {
  const inputId = useId();
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      {documents.length === 0 ? (
        <p className="mb-3 text-sm text-ink-muted">
          Sin documentos. Sube ITV, ficha técnica, seguro, manuales, etc.
        </p>
      ) : (
        <ul className="mb-3 grid gap-2">
          {documents.map((document) => (
            <li
              key={document.path}
              className="flex items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="truncate">{document.name}</span>
                {document.uploadedAt && (
                  <span className="shrink-0 text-xs text-ink-muted">
                    {formatDate(new Date(document.uploadedAt))}
                  </span>
                )}
              </span>
              <span className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onOpen(document);
                  }}
                >
                  <ExternalLink aria-hidden="true" />
                  Ver
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-ink hover:bg-danger-soft hover:text-danger-ink"
                  onClick={() => {
                    onRemove(document);
                  }}
                >
                  <Trash2 aria-hidden="true" />
                  Eliminar
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <label
        htmlFor={inputId}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed border-brand bg-brand-soft px-3 text-xs font-semibold text-brand-strong transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus hover:bg-brand/20"
      >
        <Upload className="size-4" aria-hidden="true" />
        Subir documento
        <input
          id={inputId}
          type="file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onUpload(file);
          }}
        />
      </label>
    </div>
  );
}
