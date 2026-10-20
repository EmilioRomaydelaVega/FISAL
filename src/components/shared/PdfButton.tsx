import { Download, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { ButtonVariant } from "@/components/ui/button-styles";

interface PdfButtonProps {
  onClick: () => void;
  /** Mientras se genera el PDF el botón se desactiva y lo indica. */
  busy?: boolean;
  variant?: ButtonVariant;
}

export function PdfButton({ onClick, busy = false, variant = "primary" }: PdfButtonProps) {
  return (
    <Button variant={variant} size="sm" onClick={onClick} disabled={busy} aria-busy={busy}>
      {busy ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <Download aria-hidden="true" />
      )}
      {busy ? "Generando…" : "PDF"}
    </Button>
  );
}
