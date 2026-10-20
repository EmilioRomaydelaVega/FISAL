import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";

interface StepErrorBoundaryProps {
  children: ReactNode;
}

interface StepErrorBoundaryState {
  error: unknown;
}

/**
 * Si algo falla dentro de un paso del asistente, muestra el aviso en ese paso
 * en lugar de cerrar la aplicación, y conserva los datos introducidos.
 */
export class StepErrorBoundary extends Component<StepErrorBoundaryProps, StepErrorBoundaryState> {
  override state: StepErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): StepErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Error en el paso del informe:", error, info);
  }

  override render() {
    if (this.state.error == null) return this.props.children;
    return (
      <Alert
        tone="danger"
        icon={<AlertTriangle />}
        title="Algo ha fallado en este paso, pero tu inspección no se ha perdido."
      >
        <p className="text-xs">{getErrorMessage(this.state.error)}</p>
        <Button
          size="sm"
          className="mt-3"
          onClick={() => {
            this.setState({ error: null });
          }}
        >
          Reintentar
        </Button>
      </Alert>
    );
  }
}
