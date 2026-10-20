import { ServiceError } from "@/lib/errors";

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

type Data<R extends QueryResult> = NonNullable<R["data"]>;

/** Devuelve los datos de una consulta o lanza un `ServiceError` con contexto. */
export function unwrap<R extends QueryResult>(result: R, context: string): Data<R> {
  const data = unwrapOptional(result, context);
  if (data === null) throw new ServiceError(context, "sin respuesta");
  return data;
}

/** Como `unwrap`, pero acepta que no haya fila (consultas `maybeSingle`). */
export function unwrapOptional<R extends QueryResult>(result: R, context: string): Data<R> | null {
  if (result.error) throw new ServiceError(context, result.error.message, { cause: result.error });
  const data: R["data"] = result.data;
  return data ?? null;
}

/** Para escrituras sin datos de retorno. */
export function assertOk({ error }: { error: { message: string } | null }, context: string): void {
  if (error) throw new ServiceError(context, error.message, { cause: error });
}
