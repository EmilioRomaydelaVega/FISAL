/** Error de la capa de servicios con un mensaje apto para mostrar al usuario. */
export class ServiceError extends Error {
  /** Mensaje original del servidor, sin el contexto. */
  readonly detail: string;

  constructor(context: string, detail?: string, options?: { cause?: unknown }) {
    super(detail ? `${context}: ${detail}` : context, options);
    this.name = "ServiceError";
    this.detail = detail ?? context;
  }
}

/** Mensaje completo de un error, con su contexto. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Mensaje original del error, sin el contexto de la operación. */
export function getErrorDetail(error: unknown): string {
  return error instanceof ServiceError ? error.detail : getErrorMessage(error);
}
